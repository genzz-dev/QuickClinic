// controllers/labController.js (for patient/doctor to search labs)
import Lab from '../models/Lab/Lab.js';

// Search labs
export const searchLabs = async (req, res) => {
  try {
    const { name, city, testName } = req.query;

    const query = { isActive: true };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (testName) {
      query['tests.testName'] = { $regex: testName, $options: 'i' };
    }

    const labs = await Lab.find(query)
      .select(
        'name description address contact logo ratings tests homeCollectionAvailable homeCollectionFee'
      )
      .lean();

    res.json({
      count: labs.length,
      labs,
    });
  } catch (error) {
    console.error('Error searching labs:', error);
    res.status(500).json({ message: 'Failed to search labs' });
  }
};

// Get lab details
export const getLabDetails = async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findById(labId).select('-staff -labAdminId').lean();

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json({ lab });
  } catch (error) {
    console.error('Error fetching lab details:', error);
    res.status(500).json({ message: 'Failed to fetch lab details' });
  }
};

// Get lab tests
export const getLabTests = async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findById(labId).select('tests name').lean();

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const activeTests = lab.tests.filter((test) => test.isActive);

    res.json({
      labName: lab.name,
      count: activeTests.length,
      tests: activeTests,
    });
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
};
