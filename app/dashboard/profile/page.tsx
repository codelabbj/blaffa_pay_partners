"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Edit, Save, X, User, Shield, Mail, Phone, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  display_name: string;
  is_verified: boolean;
  contact_method: string;
  created_at: string;
  updated_at: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();

  // Get token from localStorage (same as sign-in-form and dashboard layout)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }

  useEffect(() => {
    // Redirect if not logged in (no token)
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${baseUrl}api/auth/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast, router, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    });
    setEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 md:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Profil Utilisateur</h1>
            <p className="text-blue-100 text-sm md:text-lg">Gérez vos informations personnelles</p>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-8">
          <div className="space-y-4 md:space-y-6">
            <Skeleton className="h-6 md:h-8 w-32 md:w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Skeleton className="h-10 md:h-12 w-full" />
              <Skeleton className="h-10 md:h-12 w-full" />
              <Skeleton className="h-10 md:h-12 w-full" />
              <Skeleton className="h-10 md:h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Profil Utilisateur</h1>
              <p className="text-blue-100 text-sm md:text-lg">Gérez vos informations personnelles</p>
            </div>
            <div className="flex md:hidden items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
                <div className="text-lg md:text-2xl font-bold">{profile?.display_name || "Utilisateur"}</div>
                <div className="text-blue-100 text-xs md:text-sm">Nom d'affichage</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">{profile?.display_name || "Utilisateur"}</div>
                <div className="text-blue-100 text-sm">Nom d'affichage</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Profile Information */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl">
                <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Informations Personnelles</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Vos données de profil et paramètres</p>
              </div>
            </div>
            {!editing ? (
              <Button 
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl w-full lg:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="rounded-xl md:rounded-2xl border-2 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl md:rounded-2xl w-full sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Profile Avatar and Status */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                <AvatarFallback className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile?.display_name || `${profile?.first_name} ${profile?.last_name}`}
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
                  <Badge variant={profile?.is_active ? "default" : "destructive"} className="text-xs md:text-sm">
                    {profile?.is_active ? "Compte Actif" : "Compte Inactif"}
                  </Badge>
                  <Badge variant={profile?.is_verified ? "default" : "secondary"} className="text-xs md:text-sm">
                    {profile?.is_verified ? "Vérifié" : "Non Vérifié"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label htmlFor="first_name" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Prénom
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={editing ? formData.first_name || '' : profile?.first_name || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-sm md:text-base"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Nom
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={editing ? formData.last_name || '' : profile?.last_name || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-sm md:text-base"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editing ? formData.email || '' : profile?.email || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 pr-10 text-sm md:text-base"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {profile?.email_verified ? (
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
                {profile?.email_verified && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Email vérifié
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Téléphone
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={editing ? formData.phone || '' : profile?.phone || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 pr-10 text-sm md:text-base"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {profile?.phone_verified ? (
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
                {profile?.phone_verified && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Téléphone vérifié
                  </p>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg md:rounded-xl">
                    <Shield className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">ID Utilisateur</p>
                    <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white font-mono break-all">{profile?.uid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg md:rounded-xl">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Membre depuis</p>
                    <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg md:rounded-xl">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Méthode de Contact</p>
                    <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white capitalize">
                      {profile?.contact_method || 'Email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}