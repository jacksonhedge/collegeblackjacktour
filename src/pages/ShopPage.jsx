import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const ShopPage = () => {
  const [shirts, setShirts] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [fraternities, setFraternities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedFraternity, setSelectedFraternity] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Betting brand shirts data
  const brandShirts = [
    {
      id: 'fd1',
      brand: 'FanDuel',
      name: 'FanDuel Classic Tee',
      price: 29.99,
      image: '/images/fanduel-shirt.jpg',
      colors: ['Navy', 'Black', 'White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: 'scheduled'
    },
    {
      id: 'dk1',
      brand: 'DraftKings',
      name: 'DraftKings Premium Shirt',
      price: 34.99,
      image: '/images/draftkings-shirt.jpg',
      colors: ['Green', 'Black', 'Gray'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: 'scheduled'
    },
    {
      id: 'mgm1',
      brand: 'BetMGM',
      name: 'BetMGM Lion Tee',
      price: 32.99,
      image: '/images/betmgm-shirt.jpg',
      colors: ['Gold', 'Black', 'White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: 'unscheduled'
    },
    {
      id: 'cs1',
      brand: 'Caesars',
      name: 'Caesars Empire Shirt',
      price: 31.99,
      image: '/images/caesars-shirt.jpg',
      colors: ['Purple', 'Gold', 'Black'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: 'scheduled'
    },
    {
      id: 'pb1',
      brand: 'PointsBet',
      name: 'PointsBet Performance Tee',
      price: 28.99,
      image: '/images/pointsbet-shirt.jpg',
      colors: ['Red', 'White', 'Black'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: 'unscheduled'
    },
    {
      id: 'bs1',
      brand: 'Barstool',
      name: 'Barstool Sportsbook Classic',
      price: 27.99,
      image: '/images/barstool-shirt.jpg',
      colors: ['Black', 'Red', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: 'scheduled'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch colleges
        const collegesRef = collection(db, 'colleges');
        const collegesSnapshot = await getDocs(collegesRef);
        const collegesData = collegesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch fraternities
        const fraternitiesRef = collection(db, 'fraternities');
        const fraternitiesSnapshot = await getDocs(fraternitiesRef);
        const fraternitiesData = fraternitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // For now, we'll use the brandShirts array as our shirt data
        // In production, you'd fetch this from Firebase
        setShirts(brandShirts);
        setColleges(collegesData);
        setFraternities(fraternitiesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setShirts(brandShirts); // Fallback to static data
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterShirts = (shirts) => {
    return shirts.filter(shirt => {
      const matchesSearch = shirt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shirt.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBrand = !selectedBrand || shirt.brand === selectedBrand;
      
      return matchesSearch && matchesBrand;
    });
  };

  const ShirtCard = ({ shirt }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative p-4">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">{shirt.brand}</div>
            <div className="text-gray-600">Premium Collection</div>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
          {shirt.availability === 'scheduled' ? 'Available Now' : 'Coming Soon'}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{shirt.name}</h3>
        <p className="text-2xl font-bold text-blue-600 mb-3">${shirt.price}</p>
        
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">Available Colors:</p>
          <div className="flex gap-2">
            {shirt.colors.map(color => (
              <span key={color} className="text-xs bg-gray-200 px-2 py-1 rounded">
                {color}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Sizes:</p>
          <div className="flex gap-2">
            {shirt.sizes.map(size => (
              <span key={size} className="text-xs border border-gray-300 px-2 py-1 rounded">
                {size}
              </span>
            ))}
          </div>
        </div>
        
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors">
          {shirt.availability === 'scheduled' ? 'Add to Cart' : 'Notify Me'}
        </button>
      </div>
    </div>
  );

  const uniqueBrands = [...new Set(brandShirts.map(shirt => shirt.brand))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-xl">Loading shop...</div>
        </div>
      </div>
    );
  }

  const scheduledShirts = filterShirts(shirts.filter(s => s.availability === 'scheduled'));
  const unscheduledShirts = filterShirts(shirts.filter(s => s.availability === 'unscheduled'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Shop Premium Shirts</h1>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search shirts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedFraternity}
              onChange={(e) => setSelectedFraternity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Fraternities</option>
              {fraternities.map(fraternity => (
                <option key={fraternity.id} value={fraternity.id}>
                  {fraternity.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Available Now Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Available Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledShirts.length === 0 ? (
              <div className="col-span-full text-white text-center">
                No shirts available at the moment.
              </div>
            ) : (
              scheduledShirts.map(shirt => (
                <ShirtCard key={shirt.id} shirt={shirt} />
              ))
            )}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unscheduledShirts.length === 0 ? (
              <div className="col-span-full text-white text-center">
                No upcoming shirts.
              </div>
            ) : (
              unscheduledShirts.map(shirt => (
                <ShirtCard key={shirt.id} shirt={shirt} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;