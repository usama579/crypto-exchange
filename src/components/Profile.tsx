'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Calendar, Key, Save, Edit3, Eye, EyeOff, X } from 'lucide-react';

export default function Profile() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Change password modal state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Resend verification state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (session?.user) {
      setFormData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          }
        });
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    // Validate password strength
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordMessage('');
        }, 2000);
      } else {
        setPasswordMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordMessage('An error occurred while changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent successfully!');
        // Clear message after 5 seconds
        setTimeout(() => {
          setResendMessage('');
        }, 5000);
      } else {
        setResendMessage(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      setResendMessage('An error occurred while sending verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const refreshUserSession = async () => {
    try {
      // Get fresh user data from the database
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update the session with fresh data
        await update({
          ...session,
          user: {
            ...session?.user,
            ...data.user
          }
        });

        // Show success message if verification status changed
        if (data.user.isEmailVerified && !session?.user?.isEmailVerified) {
          setResendMessage('Email verification status updated!');
          setTimeout(() => {
            setResendMessage('');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <User size={64} className="mx-auto text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <User size={32} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user.firstName} {session.user.lastName}
              </h1>
              <p className="text-gray-600">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={18} className="mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('success')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <User size={20} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium">{session.user.firstName || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User size={20} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium">{session.user.lastName || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {new Date(session.user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            {session.user.referralCode && (
              <div className="flex items-center">
                <Key size={20} className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Referral Code</p>
                  <p className="font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                    {session.user.referralCode}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                session.user.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div>
                <p className="text-sm text-gray-600">Email Status</p>
                <p className="font-medium">
                  {session.user.isEmailVerified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Account Security</h2>

        {resendMessage && (
          <div className={`p-4 rounded-lg mb-4 ${
            resendMessage.includes('success')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {resendMessage}
          </div>
        )}

        {!session.user.isEmailVerified && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">
                  If you've already verified your email, click refresh to update your status.
                </p>
              </div>
              <button
                onClick={refreshUserSession}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Key size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-600">Last changed: Not available</p>
              </div>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Mail size={20} className="text-gray-500 mr-3" />
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-600">
                  {session.user.isEmailVerified ? 'Your email is verified' : 'Please verify your email'}
                </p>
              </div>
            </div>
            {!session.user.isEmailVerified && (
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {passwordMessage && (
                <div className={`p-4 rounded-lg mb-6 ${
                  passwordMessage.includes('success')
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {passwordMessage}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-700"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-700"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Password must be at least 8 characters long</li>
                    <li>New password must be different from current password</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}