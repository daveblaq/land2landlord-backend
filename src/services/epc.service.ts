import axios from 'axios';

export interface EpcLookupResult {
  current: string | null;
  potential: string | null;
}

const lookupEpcRating = async (postcode: string, addressLine?: string): Promise<EpcLookupResult | null> => {
  const epcApiKey = process.env.EPC_API_KEY;
  if (!epcApiKey) {
    console.warn('EPC_API_KEY is not configured in environment variables');
    return null;
  }

  try {
    const trimmedPostcode = postcode.trim();
    
    // 1. Search for domestic certificates by postcode
    const response = await axios.get('https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search', {
      params: {
        postcode: trimmedPostcode,
      },
      headers: {
        'Authorization': `Bearer ${epcApiKey}`,
        'Accept': 'application/json',
      },
    });

    const data = response.data?.data || [];
    if (data.length === 0) {
      return null;
    }

    let matchedCert: any = null;

    // If we have an addressLine, find the best match
    if (addressLine) {
      const cleanAddress = addressLine.toLowerCase().trim();
      
      matchedCert = data.find((item: any) => {
        const addr1 = (item.addressLine1 || '').toLowerCase().trim();
        const addr2 = (item.addressLine2 || '').toLowerCase().trim();
        
        // Match house number or street name
        if (addr1 && cleanAddress.includes(addr1)) return true;
        if (addr2 && cleanAddress.includes(addr2)) return true;
        
        return false;
      });
    }

    // Fallback to the first certificate if no address match is found
    if (!matchedCert) {
      matchedCert = data[0];
    }

    if (!matchedCert || !matchedCert.certificateNumber) {
      return null;
    }

    const certNumber = matchedCert.certificateNumber;

    // 2. Fetch full certificate details to retrieve both current and potential ratings
    try {
      const detailsResponse = await axios.get('https://api.get-energy-performance-data.communities.gov.uk/api/certificate', {
        params: {
          certificate_number: certNumber,
        },
        headers: {
          'Authorization': `Bearer ${epcApiKey}`,
          'Accept': 'application/json',
        },
      });

      const details = detailsResponse.data?.data;
      if (details) {
        return {
          current: details.current_energy_efficiency_band || matchedCert.currentEnergyEfficiencyBand || null,
          potential: details.potential_energy_efficiency_band || null,
        };
      }
    } catch (detailsError: any) {
      console.warn(`Failed to fetch details for EPC cert ${certNumber}:`, detailsError.message || detailsError);
    }

    // Fallback: return only the current rating found in search results if details endpoint fails
    return {
      current: matchedCert.currentEnergyEfficiencyBand || null,
      potential: null,
    };
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        console.log(`No EPC certificates found for postcode: ${postcode}`);
        return null;
      }
      if (status === 400) {
        console.log(`Invalid postcode format for EPC lookup: ${postcode}`);
        return null;
      }
      console.warn(`EPC API returned status ${status}:`, error.response.data || error.message);
      return null;
    }
    console.error('Error looking up EPC rating:', error.message || error);
    return null;
  }
};

const epcService = {
  lookupEpcRating,
};

export default epcService;
