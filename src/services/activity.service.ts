import { Property } from '../models/property.model';
import { Lead } from '../models/lead.model';

export interface ActivityFeedItem {
  id: string;
  type: 'lead' | 'property';
  title: string;
  description: string;
  time: Date;
  color: string;
}

const getRecentActivities = async (): Promise<ActivityFeedItem[]> => {
  // Fetch top 5 recently updated properties and leads
  const properties = await Property.find({}).sort({ updatedAt: -1 }).limit(5);
  const leads = await Lead.find({}).sort({ updatedAt: -1 }).limit(5);

  const propertyActivities: ActivityFeedItem[] = properties.map((p) => {
    // If updated time matches created time within 10 seconds, count as listed/created
    const isCreated = Math.abs(p.updatedAt.getTime() - p.createdAt.getTime()) < 10000;
    return {
      id: `property-${p._id}`,
      type: 'property',
      title: isCreated ? 'Property listed' : 'Property updated',
      description: isCreated
        ? `${p.title} at ${p.location} listed by Admin`
        : `Price/details updated for ${p.title} at ${p.location}`,
      time: p.updatedAt,
      color: isCreated ? 'bg-success-500' : 'bg-purple-500',
    };
  });

  const leadActivities: ActivityFeedItem[] = leads.map((l) => {
    const isCreated = Math.abs(l.updatedAt.getTime() - l.createdAt.getTime()) < 10000;
    return {
      id: `lead-${l._id}`,
      type: 'lead',
      title: isCreated ? 'New lead submitted' : 'Lead status updated',
      description: isCreated
        ? `${l.name} enquired about ${l.type}`
        : `${l.name}'s lead marked as ${l.status}`,
      time: l.updatedAt,
      color: isCreated
        ? 'bg-brand-500'
        : l.status === 'Closed'
        ? 'bg-success-600'
        : 'bg-warning-500',
    };
  });

  // Combine, sort by time desc, and select top 5
  return [...propertyActivities, ...leadActivities]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5);
};

const activityService = {
  getRecentActivities,
};

export default activityService;
