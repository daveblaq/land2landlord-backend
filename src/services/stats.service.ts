import { Property } from '../models/property.model';
import { Lead } from '../models/lead.model';

const calculateMoM = (current: number, previous: number) => {
  if (previous === 0) {
    return {
      change: current > 0 ? '100%' : '0%',
      trend: 'positive' as const,
    };
  }
  const diff = current - previous;
  const percentage = Math.round((diff / previous) * 100);
  return {
    change: `${Math.abs(percentage)}%`,
    trend: percentage >= 0 ? ('positive' as const) : ('negative' as const),
  };
};

const getStats = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // 1. Total Properties calculations
  const totalPropertiesVal = await Property.countDocuments({});
  const propsThisMonth = await Property.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const propsLastMonth = await Property.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  });
  const propsMoM = calculateMoM(propsThisMonth, propsLastMonth);

  // 2. Active Leads calculations
  const totalActiveLeadsVal = await Lead.countDocuments({ status: { $ne: 'Closed' } });
  const activeLeadsThisMonth = await Lead.countDocuments({
    status: { $ne: 'Closed' },
    createdAt: { $gte: thirtyDaysAgo },
  });
  const activeLeadsLastMonth = await Lead.countDocuments({
    status: { $ne: 'Closed' },
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  });
  const activeLeadsMoM = calculateMoM(activeLeadsThisMonth, activeLeadsLastMonth);

  // 3. Avg. Monthly Rent calculations (using MongoDB aggregation)
  const avgRentAllRes = await Property.aggregate([
    {
      $group: {
        _id: null,
        averageRent: { $avg: '$investmentMetrics.monthlyRent' },
      },
    },
  ]);
  const avgRentAll = avgRentAllRes.length > 0 ? Math.round(avgRentAllRes[0].averageRent || 0) : 0;

  const avgRentBefore30Res = await Property.aggregate([
    {
      $match: {
        createdAt: { $lt: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: null,
        averageRent: { $avg: '$investmentMetrics.monthlyRent' },
      },
    },
  ]);
  const avgRentBefore30 =
    avgRentBefore30Res.length > 0 ? Math.round(avgRentBefore30Res[0].averageRent || 0) : 0;

  let rentChange = '0%';
  let rentTrend: 'positive' | 'negative' = 'positive';
  if (avgRentBefore30 > 0) {
    const diff = avgRentAll - avgRentBefore30;
    const pct = Math.round((diff / avgRentBefore30) * 100);
    rentChange = `${Math.abs(pct)}%`;
    rentTrend = pct >= 0 ? 'positive' : 'negative';
  } else if (avgRentAll > 0) {
    rentChange = '100%';
  }

  // 4. Conversion Rate calculations
  const totalLeads = await Lead.countDocuments({});
  const closedLeads = await Lead.countDocuments({ status: 'Closed' });
  const conversionRateVal = totalLeads > 0 ? parseFloat(((closedLeads / totalLeads) * 100).toFixed(1)) : 0;

  const leadsThisMonth = await Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const leadsThisMonthClosed = await Lead.countDocuments({
    status: 'Closed',
    createdAt: { $gte: thirtyDaysAgo },
  });
  const convRateThisMonth =
    leadsThisMonth > 0 ? (leadsThisMonthClosed / leadsThisMonth) * 100 : 0;

  const leadsLastMonth = await Lead.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  });
  const leadsLastMonthClosed = await Lead.countDocuments({
    status: 'Closed',
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
  });
  const convRateLastMonth =
    leadsLastMonth > 0 ? (leadsLastMonthClosed / leadsLastMonth) * 100 : 0;

  let convChange = '0%';
  let convTrend: 'positive' | 'negative' = 'positive';
  if (convRateLastMonth > 0) {
    const diff = convRateThisMonth - convRateLastMonth;
    const pct = Math.round((diff / convRateLastMonth) * 100);
    convChange = `${Math.abs(pct)}%`;
    convTrend = pct >= 0 ? 'positive' : 'negative';
  } else if (convRateThisMonth > 0) {
    convChange = '100%';
  }

  return {
    totalProperties: {
      value: totalPropertiesVal,
      change: propsMoM.change,
      trend: propsMoM.trend,
    },
    activeLeads: {
      value: totalActiveLeadsVal,
      change: activeLeadsMoM.change,
      trend: activeLeadsMoM.trend,
    },
    avgMonthlyRent: {
      value: avgRentAll,
      change: rentChange,
      trend: rentTrend,
    },
    conversionRate: {
      value: conversionRateVal,
      change: convChange,
      trend: convTrend,
    },
  };
};

const statsService = {
  getStats,
};

export default statsService;
