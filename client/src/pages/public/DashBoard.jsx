// QuickClinicHomepage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  searchDoctors,
  searchClinics,
  getSearchSuggestions
} from '../../service/publicapi';

import HeroSection from '../../components/public/DashBoard/HeroSection';
import FeaturedDoctors from '../../components/public/DashBoard/FeaturedDoctors';
import NearbyClinicsList from '../../components/public/DashBoard/NearbyClinicsList';
import FeaturesSection from '../../components/public/DashBoard/FeaturesSection';
import CTASection from '../../components/public/DashBoard/CTASection';

const QuickClinicHomepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('doctors');
  const [suggestions, setSuggestions] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [nearbyClinic, setNearbyClinic] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const stats = {
    totalDoctors: "5,000+",
    totalClinics: "1,200+",
    totalAppointments: "50K+"
  };
  
  const [searchStats, setSearchStats] = useState({
    topSpecialties: [],
    popularClinics: [],
    recentSearches: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const response = await getSearchSuggestions(searchQuery);
          if (response.success) {
            setSuggestions(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      };
      
      const debounceTimer = setTimeout(fetchSuggestions, 200);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        const [doctorsResponse, clinicsResponse] = await Promise.all([
          searchDoctors({ 
            limit: 8, 
            sortBy: 'averageRating',
            order: 'desc',
            isVerified: true
          }),
          searchClinics({ 
            limit: 6,
            isVerified: true,
            sortBy: 'rating',
            order: 'desc'
          })
        ]);

        const doctors = doctorsResponse.data?.doctors || [];
        const clinics = clinicsResponse.data?.clinics || [];

        setFeaturedDoctors(doctors);
        setNearbyClinic(clinics);

        setSearchStats({
          topSpecialties: [...new Set(doctors.map(d => d.specialization))].slice(0, 6),
          popularClinics: clinics.slice(0, 4),
          recentSearches: []
        });
        
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
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery('');
    setSuggestions([]);
    
    if (suggestion.type === 'doctor') {
      navigate(`/doctor/${suggestion.id}`);
    } else if (suggestion.type === 'clinic') {
      navigate(`/clinic/${suggestion.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.name || suggestion)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection 
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchType={searchType}
        setSearchType={setSearchType}
        suggestions={suggestions}
        searchStats={searchStats}
        isLoading={isLoading}
        handleSearch={handleSearch}
        handleSuggestionClick={handleSuggestionClick}
        navigate={navigate}
      />

      {featuredDoctors.length > 0 && (
        <FeaturedDoctors 
          doctors={featuredDoctors}
          navigate={navigate}
        />
      )}

      {nearbyClinic.length > 0 && (
        <NearbyClinicsList 
          clinics={nearbyClinic}
          navigate={navigate}
        />
      )}

      <FeaturesSection />

      <CTASection navigate={navigate} />
    </div>
  );
};

export default QuickClinicHomepage;
