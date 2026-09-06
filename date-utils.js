/* date-utils.js - date and version helpers shared by the vanilla app. */

(function (window) {
  'use strict';

  function parseDateOnly(value) {
    if (!value) return null;
    const datePart = String(value).split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
    const [year, month, day] = datePart.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  function formatDateShort(iso) {
    const d = parseDateOnly(iso);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const parsed = new Date(iso);
    const timestamp = parsed.getTime();
    if (Number.isNaN(timestamp)) return '';
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDateShort(iso);
  }

  function isOverdue(d) {
    const dueDate = parseDateOnly(d);
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  function isDueSoon(d) {
    const dueDate = parseDateOnly(d);
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = (dueDate - today) / 864e5;
    return diff >= 0 && diff <= 3;
  }

  function getAppVersion() {
    return window.WT_APP_VERSION || '3.6.1';
  }

  function formatMonthInput(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function monthRange(monthInput) {
    const safe = /^\d{4}-\d{2}$/.test(monthInput || '') ? monthInput : formatMonthInput();
    const [yy, mm] = safe.split('-').map(Number);
    const start = new Date(Date.UTC(yy, mm - 1, 1));
    const end = new Date(Date.UTC(yy, mm, 1));
    const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return { safe, start, end, label };
  }

  function dateInRange(iso, start, end) {
    if (!iso) return false;
    const dt = new Date(iso);
    return dt >= start && dt < end;
  }

  function completedAtForReport(project) {
    if (!project) return null;
    if (project.completedAt) return project.completedAt;
    return project.status === 'completed' ? project.updatedAt : null;
  }

  const api = Object.freeze({
    formatDateShort,
    timeAgo,
    isOverdue,
    isDueSoon,
    getAppVersion,
    formatMonthInput,
    monthRange,
    dateInRange,
    completedAtForReport
  });

  window.WTDateUtils = api;

  // Compatibility globals for existing classic-script consumers and browser console use.
  Object.assign(window, api);
})(window);
