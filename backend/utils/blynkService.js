const axios = require('axios');

class BlynkService {
  constructor() {
    this.baseUrl = 'https://blynk.cloud/external/api';
  }

  // Helper to build URL
  getUrl(token, endpoint) {
    return `${this.baseUrl}/${endpoint}?token=${token}`;
  }

  // Check connection for a SPECIFIC user
  async isConnected(token) {
    try {
      const response = await axios.get(this.getUrl(token, 'isHardwareConnected'));
      return response.data === true;
    } catch (error) {
      return false;
    }
  }

  // Fetch value of a SINGLE pin
  async getPinValue(token, pin) {
    try {
      const response = await axios.get(`${this.baseUrl}/get?token=${token}&pin=${pin}`);
      return response.data;
    } catch (error) {
      console.error(`Blynk Read Error (${pin}):`, error.message);
      return 0;
    }
  }

  // Write value to a SINGLE pin
  async setPinValue(token, pin, value) {
    try {
      const response = await axios.get(`${this.baseUrl}/update?token=${token}&pin=${pin}&value=${value}`);
      return response.status === 200;
    } catch (error) {
      console.error(`Blynk Write Error (${pin}):`, error.message);
      throw new Error('Failed to control device');
    }
  }

  // Batch Fetch: Get values for MULTIPLE pins at once
  async getBatchData(token, pins) {
    // Blynk HTTP API doesn't support batch read in one call easily, 
    // so we run promises in parallel.
    const promises = pins.map(pin => 
      this.getPinValue(token, pin).then(val => ({ pin, value: val }))
    );
    
    const results = await Promise.all(promises);
    
    // Convert array [{pin: 'v0', value: 50}] to object {v0: 50}
    return results.reduce((acc, curr) => {
      acc[curr.pin] = curr.value;
      return acc;
    }, {});
  }
}

module.exports = new BlynkService();