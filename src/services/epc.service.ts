import axios from 'axios';

const lookupEpcRating = async (postcode: string, addressLine?: string): Promise<string | null> => {
  const epcApiKey = process.env.EPC_API_KEY;
  if (!epcApiKey) {
    console.warn('EPC_API_KEY is not configured in environment variables');
    return null;
  }

  try {
    const authHeader = Buffer.from(epcApiKey).toString('base64');
    
    // Normalize postcode (remove spaces)
    const normalizedPostcode = postcode.trim().replace(/\s+/g, '');
    
    const response = await axios.get('https://epc.opendatacommunities.org/api/v1/domestic/search', {
      params: {
        postcode: normalizedPostcode,
        size: 100,
      },
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json',
      },
    });

    const rows = response.data?.rows || [];
    if (rows.length === 0) {
      return null;
    }

    // If we have an addressLine, find the best match
    if (addressLine) {
      const cleanAddress = addressLine.toLowerCase().trim();
      
      const bestMatch = rows.find((row: any) => {
        const addr1 = (row['address1'] || '').toLowerCase().trim();
        const addr2 = (row['address2'] || '').toLowerCase().trim();
        
        // Match house number or street name
        if (addr1 && cleanAddress.includes(addr1)) return true;
        if (addr2 && cleanAddress.includes(addr2)) return true;
        
        return false;
      });

      if (bestMatch) {
        return bestMatch['current-energy-rating'] || null;
      }
    }

    // Fallback: return the rating of the first row
    return rows[0]['current-energy-rating'] || null;
  } catch (error: any) {
    console.error('Error looking up EPC rating:', error.message || error);
    return null;
  }
};

const epcService = {
  lookupEpcRating,
};

export default epcService;
