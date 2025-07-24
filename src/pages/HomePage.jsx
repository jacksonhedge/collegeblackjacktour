import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = () => {
  const { currentUser, loading } = useAuth();

  // Early return with minimal content while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 text-gray-800">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <LoadingSpinner size="lg" color="blue" text="Loading Bankroll..." />
          </div>
        </div>
      </div>
    );
  }

  // Example transaction data for the right side
  const exampleTransactions = [
    {
      id: 1,
      type: 'paid',
      subject: 'You paid your Season Long Fantasy Dues',
      amount: '$75.00',
      platform: 'Sleeper',
      platformLogo: '/images/sleeper.png',
      emoji: '🏈'
    },
    {
      id: 2,
      type: 'received',
      subject: 'You got paid from DraftKings!',
      amount: '$120.00',
      platform: 'DraftKings',
      platformLogo: '/images/draftkingsFantasy.png',
      emoji: '💰'
    },
    {
      id: 3,
      type: 'gift',
      subject: 'You Gifted Ben $20 on FanDuel',
      amount: '$20.00',
      platform: 'FanDuel',
      platformLogo: '/images/fanduel.png',
      emoji: '🎁'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800">
      {/* Debug Info */}
      <div className="fixed top-0 right-0 bg-green-600 text-white px-4 py-2 text-sm z-50">
        Page Loaded: HomePage
      </div>
      
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img
                  src="/images/BankrollLogoTransparent.png"
                  alt="Bankroll Logo"
                  className="h-8 w-auto"
                  onError={(e) => {
                    console.error('Failed to load logo, trying fallback');
                    e.target.src = '/images/Bankroll Gradient.jpg';
                    // If that fails too, use a text fallback
                    e.target.onerror = () => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML += '<span class="text-2xl font-bold text-blue-500">Bankroll</span>';
                    };
                  }}
                />
              </Link>
            </div>

            {/* Center section - Menu items */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative group">
                <Link to="/send-receive" className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-600 border border-gray-300 rounded">
                  Send & Receive
                </Link>
              </div>
              <div className="relative group">
                <Link to="/pay" className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-600">
                  Pay with Bankroll
                  <span className="inline-block ml-1">▼</span>
                </Link>
              </div>
              <div className="relative group">
                <Link to="/business" className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-600">
                  Bankroll for Business
                  <span className="inline-block ml-1">▼</span>
                </Link>
              </div>
              <Link to="/help" className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-600">
                Help Center
              </Link>
            </div>

            {/* Right section - Auth Buttons */}
            <div className="flex items-center space-x-4">
              {!currentUser && (
                <>
                  <Link 
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-800 hover:text-blue-600"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup"
                    className="px-5 py-2.5 bg-white text-sm font-medium text-blue-600 rounded-full border border-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    <span className="flex items-center">
                      <span className="mr-1 text-blue-600 font-bold">B</span>
                      Get Bankroll
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Main content */}
          <div>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-gray-900">
              Sports Betting Wallet <br/>
              <span className="text-blue-600">Built for you</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mb-12">
              Your one-stop destination for managing sports betting and fantasy sports finances across all platforms.
            </p>
            
            {/* QR Code Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md">
              <div className="flex items-start space-x-6">
                <img 
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX///8AAACPj4/v7++3t7fo6OjR0dH09PT6+vrz8/Ps7OzV1dXe3t7k5OSUlJRISEi+vr6dnZ1vb2+mpqbHx8dlZWVXV1eGhoY0NDR7e3vNzc2wsLATExNPT09eXl4tLS0kJCQNDQ1BQUEcHBw6OjqAgIBycnKKioohttJGAAAJA0lEQVR4nO2da3eqOhCGwXJR8IaKF7Ratf3/f/HAti5BJjBySTLs8H7aG1h5CplkMplkOp22tra2tra2tra2toL0/vUx2c3nk/noPU7IL+7GcTwdfiULFQ0Wq/VkP92cHxh83vH5sRn+dDRY9ON1GE8/7V3PsF+v8TgMXC66i16NpZRvL82ixuYT1biYLfthTkrdxck22KtODHYSVZ5+Mzo9tOOUqnI0e2+q8vPPQpWbURPNl+yXj3R6FKpTbNOZftfzCh+58ujxL3g/a4fwbUiVxw8zCKq8UT9B+vgUtKKG2g/U748WqN4p50Ll36eeqHK8alX5uDgz/nZ94/eBXvnBvMqH5x+eKs+G24bxWVT53Dw/qFR5U1P5eM9a3PYhVzmjRnlT+d/JivKFrvJ4cX2g/lrSKWXvkBgdH/+iR9TBhf0/CqsdnnvPyo9KKq9Slc8Knd+y/wO7FGX7b7ryM5XKq9v+RFE+e6gqfxDK3yhVPqZrL1w3j1flj0dpjilVXo3yxFQ+EStf2xnlqQY/qXLDxoiJJ5IZI1UumfRt7e3/s9mvfBKGRGCFldnmZrcmVX5UXHrQyqHKL2k58mYxTRYFKm9mlKcM+6TKD9nS8YGfYXLUTmJBeXCZ8lFu7yivxkHEHVX5PjtK8JRX5YeKUfmM6Sap8sRRQg97cefiqDGBB5WPHgcqr8pUflM8+yz6SlQ+eSrGLKHytcpRXoWnkTOBUflaMcprR6JQjfKLSlJWqJ1cFT2bj5soRnmVMqmFlS9IlY+Y37NLVVbluayTRoTKs6O8GkXrz1fH8Vm5tFFe5JV1lFeBNsqLvblslFfFR+LgqDIUbr56nFTlVcdRXrWj8q/WKK9ey0Z5VYxVXpWM8qpIlVfdoVD5aXCjvKpHwSjPqLmjUd45aSg65nOUV4WjvCpHlS9tHR/44uQiZZRX47Wf//gKSQ/K+wy3Uf6p8qiQJYvTr1dlCnGJNl1sTv2kvjOtUiSdLiaHH/bdj/Kl0uHkZ9dYnAMjKq/w5LJ4bqrTn5ej8vg36NfnnpXHw14K33+kVLlP5d9GXaFOjKTyXj3lGLpRXjgcvUiNpPKcRVT9wVDln8XrKZZYKv+jXKL+YaLyYs8Pp/KfBaO8sSzTKFaW6QpM5V8V7VLhVN5xPmzf2r1tVXmGzNNqT6W1RrHKP3qwlRnlXTu/Yai8u3A0UHmXWaZxrFxW/WEzyjcXMfQjyTLNkGVRXnFZg1TWJe1R/sSO8sphx82N8vHruFDl3Y7y+8JRnhvl7Y/yiWCUF2SZfI/y0w8icdqxsWkuUuVNZJmiTbHK09rHnmN38/JRfpxdkzCVdfE9yk+vK6ZBqnxjWeWTwiy27GbTyihPZpn8j/Jxvj8GN8o7zjKR35RfWaaiojRVfpTvZGCqfBNZpuSDXFz5k2XyPcpP8n02sMon5ChnPst0fyGzTD5H+Z3Cbg8MlTebZbqpnIt/Zqq8uY1N2V0s9u5vXJU3P8o/v0lJlTczyk/qHlFhqryxUb44zTaGyvOjvL0sU+fCrNWYtUa2NsrXdloslXeQZWp+/c6syvPKdMco/zhXZ2tzNpTKy2SZ9Kq8EodZpqZ5AXeVd5dlKqG5yseMrFLJKO/Z5XcOKi+ZZTJTeXbnx1Tl7WaZSrCn8s6zTCW0Gqn8iX8gCZrKX8qizEYq32yWqQQjlfeYZSpBqPKLClJWhFB5z1mmEnRV3sYxHzh0Vd771stUF/VRvtksk9Yo3ySM9RHB1w/QaLxpNB3l/WeZpnJZJo1RvtEsk9Yo31SWqZHK28nHBRc/K1d5T1mmGqN8I1mmMpW3f3wgvPCj/KK0SFieKFD5ILJMJSr/aCLLVKLyQWSZpCofTGelApVvdO+l8QXB4LJMUsqW6j1HQbxYKNrb31QeUpZJto8/1I7yAWWZZCs7UJVXg8kySWafwam8GlKWiRvlw80ycVZpiBsq2GUOOMuUHeWDzjJlR/nwVD7oLNNzTgwly5SONH/vwVB+9cGM8qFkmR7rYg9xaFmmVOVDyzKlKh9ilokcbkLNMqUqH2aWKR3lw95QEWKW6anyyxBVPsQsE1F53Ie2tTVQQswypSofapYpXRMPO8u0D3ORZs0yHUPPMm1DzjJtQ84yzQLPMo1DVvnVzOPxgWWTdyGr/BrrmrjO+Y+KJ0POMs0jPD7wQu1+DjnLNEeuvnCqd8g5Zr2/QRLSG5KQTxqLdnJCzjLx5z8GnmXKq3zoWeZd6FmmXNgz+CxzJ6b/Bq7yO7Eq34aryrPnmsLP77Kf0pJTnpCPDCwQx7uZwGeiEMJxTyDLnY0dqSXu5YScZp8iqPwscQK3n/ek3qYCWc5lEt9HotLw83uOWZYblZf3Z5mJOiJdYT/l0yQ5/fP7MR9dQY43OQlKg87v5a4/KlX56yScLBNRPUmH/g03y7QrK29o5/cKLkCXq/xzCgkiy5SrPKXyQWSZNCo3b6XKp/eJTwWd383ct4Sh8qnK5yqfZpkCGOWZfDwbQ+X1VV53lK9XOVTlA8gyGeW0dUf5aiirfAhZJhOVV2XmiAZkmbRVnlf5UM5/1E2+Eiq/FSl+m2XSPhBZofIsWaZWq7xaVT4QlDaovOIoX41A5TGzTCYqr4qzTJvgVN5ylskoyME5g+5QeSWjfFXEbZZJw8dCMMqrVarEUJZpvw9Q5Q1kmYxV/j7N0dEoX1X5HZ86oRxgx1F5paBqbx9OlskoyOHqhJuL8h4oH+Uzx8/vFPZ3vGsT49Uo7zXLZBTlk6v8Z3CjfMFJdAzl69+EuPDO1EE1w1Nl3SYZM5X/FX93mCpfb5QvwGUz1X3Ea6ryqrzzWUQqr8pOkBTdWdpqlVeLp9wqlb+P8hmG3VT5OqN8AU3c3Rq1bTubUfJoMVX+o8koX0XVd2Kpyo8DTFM9a3NXeTU4NVQGXLSPjUqzTJZH+RcafWr0jB3dkykks0zWR/k7l5p9sYmzTB5U/rXS9lR+nGX6bx/8oNM772pVZmtV/sXHGqnrOlPDsMvr57Ew7MrU0FZba2tra2tra2vrneoP1/rH0sami70AAAAASUVORK5CYII=" 
                  alt="QR Code" 
                  className="w-24 h-24"
                />
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Scan to download the Bankroll app</p>
                  <p className="text-gray-500 text-sm">or</p>
                  <Link 
                    to="/signup" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Example transactions */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 max-w-md mx-auto">
              <div className="space-y-4">
                {exampleTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full overflow-hidden mr-4">
                        <img 
                          src={transaction.platformLogo} 
                          alt={transaction.platform}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${transaction.platform}&background=random`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          {transaction.subject}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {transaction.platform} {transaction.emoji}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-lg ${
                          transaction.type === 'received' ? 'text-green-600' : 
                          transaction.type === 'paid' ? 'text-gray-900' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'received' ? '+' : ''}{transaction.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-200 rounded-full opacity-60"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          <Card className="bg-white/90 border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">All Platforms</h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-8">Connect and manage all your betting platforms in one place</p>
              <Link to={currentUser ? "/platforms" : "/login"} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base">
                {currentUser ? "View Platforms" : "Get Started"}
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Easy Transfers</h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-8">Move money between platforms or pay friends instantly</p>
              <Link to={currentUser ? "/send" : "/login"} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base">
                {currentUser ? "Send Money" : "Get Started"}
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Track Wins</h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-8">Keep track of your betting history and performance</p>
              <Link to={currentUser ? "/profile" : "/login"} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base">
                {currentUser ? "View Stats" : "Get Started"}
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pay friends section */}
        <div className="mt-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-gray-900">Pay friends</h2>
              <p className="text-xl text-gray-700 max-w-xl">
                Bankroll helps settling up feel more like catching up. Send and receive money 
                with Bankroll friends to split everyday necessities, bills, and shared activities 
                like takeout or travel.
              </p>
              <p className="text-xl text-gray-700 max-w-xl">
                Need a gift? Keep it simple and make any payment feel extra special with 
                Bankroll. <Link to="/how-it-works" className="text-blue-600 hover:underline">Find out how.</Link>
              </p>

              <div className="pt-4">
                <Link 
                  to="/learn-more" 
                  className="px-6 py-3 border border-gray-300 rounded-full text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="relative">
                <img 
                  src="/images/phone-app.jpg" 
                  alt="Bankroll app on phone" 
                  className="rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x600/e6e6e6/808080?text=Bankroll+App";
                  }}
                />
              </div>
              <div className="relative pt-12">
                <img 
                  src="/images/friends-payment.jpg" 
                  alt="Friends using Bankroll" 
                  className="rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x600/e6e6e6/808080?text=Friends+Payment";
                  }}
                />
                <div className="absolute bottom-8 right-8 bg-white p-4 rounded-xl shadow-md max-w-[200px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="text-sm font-medium">James paid Michael</p>
                      <p className="text-blue-600 text-sm">💰 Bet winnings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop your favorite brands */}
        <div className="mt-40 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-8">
                <div>
                  <img 
                    src="/images/payment-method.jpg" 
                    alt="Payment method" 
                    className="rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400/e6e6e6/808080?text=Payment+Method";
                    }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-2 bg-amber-50 p-6 rounded-lg">
                  <img src="/images/lyft.png" alt="Lyft" className="h-12 w-12 object-contain" onError={(e) => {e.target.src = "https://placehold.co/80/e6e6e6/808080?text=Lyft";}} />
                  <img src="/images/starbucks.png" alt="Starbucks" className="h-12 w-12 object-contain" onError={(e) => {e.target.src = "https://placehold.co/80/e6e6e6/808080?text=SB";}} />
                  <img src="/images/draftkingsFantasy.png" alt="DraftKings" className="h-12 w-12 object-contain" />
                  <img src="/images/fanduel.png" alt="FanDuel" className="h-12 w-12 object-contain" />
                  <img src="/images/pulsz.png" alt="Pulsz" className="h-12 w-12 object-contain" />
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-5xl font-bold text-gray-900">Shop your favorite brands</h2>
              <p className="text-xl text-gray-700 max-w-xl">
                Just like sending money to friends, you can use Bankroll to checkout at some of your favorite brands 
                in-stores and online. Now getting repaid for last night's game can cover this morning's coffee.
              </p>
              <p className="text-xl text-gray-700 max-w-xl">
                Digital gift cards are also available to send for last-minute gifts, special occasions, or just saying thanks.
                <Link to="/gift-cards" className="text-blue-600 hover:underline ml-1">Find out how.</Link>
              </p>

              <div className="pt-4">
                <Link 
                  to="/learn-more" 
                  className="px-6 py-3 border border-gray-300 rounded-full text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Manage your money on Bankroll */}
        <div className="mt-40 max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 text-center mb-20">Manage your money on Bankroll</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <img 
                src="/images/credit-card.jpg" 
                alt="Bankroll Credit Card" 
                className="rounded-lg shadow-lg w-full h-80 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x320/e6e6e6/808080?text=Credit+Card";
                }}
              />
              <h3 className="text-2xl font-bold text-gray-900">Bankroll Credit Card</h3>
              <p className="text-gray-700">
                Earn up to 3% cash back on eligible purchases with the Bankroll Credit Card. 
                There's no annual fee, no limit to the cash back you can earn, and no impact to your 
                credit score if declined.
              </p>
            </div>
            
            <div className="space-y-4">
              <img 
                src="/images/debit-card.jpg" 
                alt="Bankroll Debit Card" 
                className="rounded-lg shadow-lg w-full h-80 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x320/e6e6e6/808080?text=Debit+Card";
                }}
              />
              <h3 className="text-2xl font-bold text-gray-900">Bankroll Debit Card</h3>
              <p className="text-gray-700">
                Spend your balance in more places using the Bankroll Debit Card - all with no monthly fees 
                or minimum balance requirements. You can even earn up to 5% cash back by activating 
                offers in the app.
              </p>
            </div>
            
            <div className="space-y-4">
              <img 
                src="/images/teen-account.jpg" 
                alt="Bankroll for ages 13-17" 
                className="rounded-lg shadow-lg w-full h-80 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x320/e6e6e6/808080?text=Teen+Account";
                }}
              />
              <h3 className="text-2xl font-bold text-gray-900">Bankroll for ages 13-17</h3>
              <p className="text-gray-700">
                A debit card for teens, and Bankroll access to receive money from 
                trusted friends and family. Plus, full parental visibility and controls. All with no minimum 
                balance, no monthly fee.
              </p>
            </div>
          </div>
        </div>

        {/* Grow a business */}
        <div className="mt-40 mb-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-6xl font-bold text-gray-900">Grow a business.</h2>
              <p className="text-xl text-gray-700 max-w-xl pt-6">
                Take business payments and engage customers with the help 
                of a seamless checkout experience people already know and trust.
              </p>

              <div className="pt-4">
                <Link 
                  to="/learn-more-business" 
                  className="px-6 py-3 border border-gray-300 rounded-full text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="relative">
                <img 
                  src="/images/business-phone.jpg" 
                  alt="Business payment on phone" 
                  className="rounded-lg shadow-lg h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x600/e6e6e6/808080?text=Business+App";
                  }}
                />
              </div>
              <div className="relative pt-8">
                <img 
                  src="/images/business-payment.jpg" 
                  alt="Business payment" 
                  className="rounded-lg shadow-lg h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x600/e6e6e6/808080?text=Business+Payment";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Get $25 Today Section */}
        <div className="mt-40 mb-32 bg-gradient-to-br from-purple-600 to-purple-800 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
            <h2 className="text-6xl font-bold text-white mb-6">Get $25 Today</h2>
            <p className="text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Sign up for Bankroll and receive $25 in bonus cash to start betting with your friends. 
              No deposit required!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://apps.apple.com/app/bankroll" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img 
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1441065600" 
                  alt="Download on the App Store" 
                  className="h-14 hover:opacity-90 transition-opacity"
                />
              </a>
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-white text-purple-700 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Sign Up on Web
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-6">
              Available on iOS. Android coming soon. Must be 18+ to participate.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-300 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* QR Code Footer */}
        <div className="fixed bottom-10 right-10 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <img 
              src="data:image/png;base64,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" 
              alt="QR Code" 
              className="w-20 h-20"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">Scan to download the</p>
            <p className="font-medium text-gray-900">Bankroll app</p>
          </div>
        </div>

        {/* Responsible Gaming Footer */}
        <div className="mt-24 text-center text-sm sm:text-base text-gray-600 px-4 max-w-3xl mx-auto">
          Responsible Gaming: Please gamble responsibly. Available in New Jersey. If you or someone you know has a gambling problem and wants help, call 1-800-522-4700
        </div>
      </div>
    </div>
  );
};

export default HomePage;