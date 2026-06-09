import { followUpMeta } from './dates';

export function computeDashboardStats(leads) {
  const statusCounts = {};
  let todayFollowUps = 0;
  let overdueFollowUps = 0;
  let upcomingFollowUps = 0;
  let converted = 0;
  let notInterested = 0;

  for (const lead of leads) {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    if (lead.status === 'Converted to Appointment') converted += 1;
    if (lead.status === 'Not Interested') notInterested += 1;
    const meta = followUpMeta(lead.followUpDate);
    if (meta.kind === 'today') todayFollowUps += 1;
    if (meta.kind === 'overdue') overdueFollowUps += 1;
    if (meta.kind === 'upcoming') upcomingFollowUps += 1;
  }

  return {
    total: leads.length,
    todayFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    converted,
    notInterested,
    statusCounts,
  };
}

export function sortByFollowUpPriority(leads) {
  const priority = (lead) => {
    const m = followUpMeta(lead.followUpDate);
    if (m.kind === 'overdue') return m.days;
    if (m.kind === 'today') return 0;
    if (m.kind === 'upcoming') return 1000 + m.days;
    return 9999;
  };
  return [...leads].sort((a, b) => priority(a) - priority(b));
}

export function filterLeads(leads, filters) {
  const {
    status,
    followUpDate,
    leadDate,
    nameQuery,
    mobileQuery,
    sort,
  } = filters;

  let result = [...leads];

  if (status) result = result.filter((l) => l.status === status);
  if (followUpDate) result = result.filter((l) => l.followUpDate === followUpDate);
  if (leadDate) result = result.filter((l) => l.leadDate === leadDate);
  if (nameQuery?.trim()) {
    const q = nameQuery.trim().toLowerCase();
    result = result.filter((l) => l.patientName?.toLowerCase().includes(q));
  }
  if (mobileQuery?.trim()) {
    const q = mobileQuery.trim().replace(/\s/g, '');
    result = result.filter((l) => l.mobileNumber?.replace(/\s/g, '').includes(q));
  }

  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.leadDate) - new Date(a.leadDate));
  } else if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.leadDate) - new Date(b.leadDate));
  } else if (sort === 'followup') {
    result = sortByFollowUpPriority(result);
  }

  return result;
}
