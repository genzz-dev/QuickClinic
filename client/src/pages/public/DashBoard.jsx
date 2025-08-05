import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  ArrowRight, 
  Calendar, 
  Users, 
  Building2,
  CheckCircle,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Activity
} from 'lucide-react';
import { useEffect,useState } from 'react';
import  {
  searchDoctors,
  searchClinics,
  getSearchSuggestions
} from '../../service/publicapi'

const QuickClinicHomepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('doctors');
  const [suggestions, setSuggestions] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [nearbyClinic, setNearbyClinic] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock navigation function
  const navigate = useNavigate();

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const response = await getSearchSuggestions(searchQuery);
          setSuggestions(response.data || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      };
      
      const debounceTimer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Fetch featured doctors and nearby clinics on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch featured doctors
        const doctorsResponse = await searchDoctors({ 
          limit: 6, 
          sortBy: 'averageRating',
          order: 'desc'
        });
        setFeaturedDoctors(doctorsResponse.data?.doctors || []);

        // Fetch nearby clinics
        const clinicsResponse = await searchClinics({ 
          limit: 4,
          isVerified: true 
        });
        setNearbyClinic(clinicsResponse.data?.clinics || []);
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        query: searchQuery,
        type: searchType
      });
      navigate(`/search?${params.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const specialties = [
    { name: 'Cardiology', icon: Heart, color: 'text-red-500' },
    { name: 'Neurology', icon: Brain, color: 'text-purple-500' },
    { name: 'Ophthalmology', icon: Eye, color: 'text-blue-500' },
    { name: 'General Medicine', icon: Stethoscope, color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Google Maps Verified Clinics</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Healthcare Made
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Simple & Secure
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connect with verified doctors, book appointments instantly, and manage your health journey with confidence. All clinics are verified through Google Maps for your safety.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/nearby')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
                >
                  <MapPin className="mr-2 w-5 h-5" />
                  Find Nearby Clinics
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Verified Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">200+</div>
                  <div className="text-sm text-gray-600">Partner Clinics</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">50K+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
              </div>
            </div>

            {/* Right Content - Search Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Find Your Healthcare Provider</h2>
                
                {/* Search Type Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setSearchType('doctors')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      searchType === 'doctors'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 inline mr-2" />
                    Doctors
                  </button>
                  <button
                    onClick={() => setSearchType('clinics')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      searchType === 'clinics'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Clinics
                  </button>
                </div>

                {/* Search Form */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search for ${searchType}...`}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                    
                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-10">
                        {suggestions.slice(0, 5).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSearchQuery(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Searching...' : `Search ${searchType}`}
                  </button>
                </div>

                {/* Popular Specialties */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Popular Specialties</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {specialties.map((specialty, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(specialty.name);
                          setSearchType('doctors');
                        }}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <specialty.icon className={`w-5 h-5 ${specialty.color}`} />
                        <span className="text-sm font-medium text-gray-700">{specialty.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      {featuredDoctors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-gray-900">Top Rated Doctors</h2>
              <p className="text-xl text-gray-600">Consult with our verified healthcare professionals</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDoctors.map((doctor) => (
                <div 
                  key={doctor._id}
                  onClick={() => navigate(`/doctor/${doctor._id}`)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{doctor.averageRating || 'New'}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{doctor.yearsOfExperience}+ years</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">
                        ₹{doctor.consultationFee}
                      </div>
                      <div className="flex items-center space-x-2">
                        {doctor.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {doctor.availableForTeleconsultation && (
                          <Activity className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/doctors')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Doctors
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Nearby Clinics Section */}
      {nearbyClinic.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-gray-900">Google Verified Clinics</h2>
              <p className="text-xl text-gray-600">Trusted healthcare facilities near you</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {nearbyClinic.map((clinic) => (
                <div 
                  key={clinic._id}
                  onClick={() => navigate(`/clinic/${clinic._id}`)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      {clinic.isVerified && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          <Shield className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {clinic.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{clinic.address?.city}, {clinic.address?.state}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{clinic.doctors?.length || 0} Doctors</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/nearby')}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                View All Clinics
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose Quick Clinic?</h2>
            <p className="text-xl text-gray-600">Your health, our priority - with verified quality</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Google Verified</h3>
              <p className="text-gray-600">All our clinics are verified through Google Maps for authentic location and contact details</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Instant Booking</h3>
              <p className="text-gray-600">Book appointments in real-time with immediate confirmation and calendar sync</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Smart Scheduling</h3>
              <p className="text-gray-600">AI-powered scheduling that finds the best appointment slots based on your preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of patients who trust Quick Clinic for their healthcare needs</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up as Patient
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Join as Healthcare Provider
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuickClinicHomepage;