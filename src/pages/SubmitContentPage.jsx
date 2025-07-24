import React, { useState } from 'react';

const SubmitContentPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    fraternity: '',
    contentType: 'photo',
    description: '',
    link: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:jackson@hedgepayments.com?subject=Content Submission from ${formData.name}&body=Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ASchool: ${formData.school}%0D%0AFraternity: ${formData.fraternity}%0D%0AContent Type: ${formData.contentType}%0D%0ADescription: ${formData.description}%0D%0ALink: ${formData.link}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Submit Content</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <p className="text-white/90 mb-6">
            Have photos or videos from our tournaments? Share them with us! 
            All submissions will be sent to jackson@hedgepayments.com for review.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2" htmlFor="name">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="email">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="school">
                School/College *
              </label>
              <input
                type="text"
                id="school"
                name="school"
                required
                value={formData.school}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="University Name"
              />
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="fraternity">
                Fraternity/Organization
              </label>
              <input
                type="text"
                id="fraternity"
                name="fraternity"
                value={formData.fraternity}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Greek Organization (optional)"
              />
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="contentType">
                Content Type *
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="article">Article/Story</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Tell us about your content..."
              />
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="link">
                Link to Content
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Google Drive, Dropbox, etc. (optional)"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Submit Content
            </button>
          </form>

          <p className="text-white/70 text-sm mt-6 text-center">
            By submitting content, you agree to allow College Blackjack Tour to use your content for promotional purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmitContentPage;