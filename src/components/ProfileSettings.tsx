import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, School, Calendar, Edit3, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  full_name: string;
  school_name: string | null;
  academic_year: string | null;
  name_changes_count: number;
}

interface ProfileSettingsProps {
  onClose?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, school_name, academic_year, name_changes_count')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setEditValues(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues(profile || {});
  };

  const handleSave = async (field: string) => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const updateData: any = { [field]: editValues[field as keyof UserProfile] };
      
      // Si on modifie le nom et qu'on a déjà fait 2 modifications, empêcher
      if (field === 'full_name' && profile.name_changes_count >= 2) {
        toast({
          title: "Limite atteinte",
          description: "Vous ne pouvez modifier votre nom que 2 fois maximum.",
          variant: "destructive"
        });
        return;
      }

      // Incrémenter le compteur si on modifie le nom
      if (field === 'full_name' && editValues.full_name !== profile.full_name) {
        updateData.name_changes_count = profile.name_changes_count + 1;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      const newProfile = { ...profile, ...updateData };
      setProfile(newProfile);
      setEditValues(newProfile);
      setEditingField(null);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i <= 1; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear}`);
    }
    return years;
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès.",
      });

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Impossible de charger le profil.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Informations Personnelles</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos documents PDF générés
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email (non-éditable) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Adresse Email</Label>
          <div className="flex items-center space-x-3">
            <Input
              value={user?.email || ''}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <Badge variant="secondary" className="text-xs">Non modifiable</Badge>
          </div>
        </div>

        {/* Nom complet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Nom Complet</Label>
            <div className="flex items-center space-x-2">
              <Badge variant={profile.name_changes_count >= 2 ? "destructive" : "secondary"} className="text-xs">
                {profile.name_changes_count}/2 modifications
              </Badge>
              {editingField !== 'full_name' && profile.name_changes_count < 2 && (
                <Button
                  onClick={() => handleEdit('full_name')}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {editingField === 'full_name' ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editValues.full_name || ''}
                onChange={(e) => setEditValues({ ...editValues, full_name: e.target.value })}
                placeholder="Votre nom complet"
                disabled={saving}
              />
              <Button
                onClick={() => handleSave('full_name')}
                disabled={saving || !editValues.full_name?.trim()}
                size="sm"
                className="h-10"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-10"
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              value={profile.full_name}
              disabled
              className="bg-gray-50"
            />
          )}
        </div>

        {/* École */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              <School className="h-4 w-4 inline mr-1" />
              Nom de l'École
            </Label>
            {editingField !== 'school_name' && (
              <Button
                onClick={() => handleEdit('school_name')}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {editingField === 'school_name' ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editValues.school_name || ''}
                onChange={(e) => setEditValues({ ...editValues, school_name: e.target.value })}
                placeholder="Nom de votre établissement"
                disabled={saving}
              />
              <Button
                onClick={() => handleSave('school_name')}
                disabled={saving}
                size="sm"
                className="h-10"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-10"
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              value={profile.school_name || 'Non renseigné'}
              disabled
              className="bg-gray-50"
            />
          )}
        </div>

        {/* Année scolaire */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 inline mr-1" />
              Année Scolaire
            </Label>
            {editingField !== 'academic_year' && (
              <Button
                onClick={() => handleEdit('academic_year')}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {editingField === 'academic_year' ? (
            <div className="flex items-center space-x-2">
              <select
                value={editValues.academic_year || ''}
                onChange={(e) => setEditValues({ ...editValues, academic_year: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={saving}
              >
                <option value="">Sélectionner une année</option>
                {generateAcademicYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Button
                onClick={() => handleSave('academic_year')}
                disabled={saving}
                size="sm"
                className="h-10"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-10"
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              value={profile.academic_year || 'Non renseignée'}
              disabled
              className="bg-gray-50"
            />
          )}
        </div>

        <Separator className="my-6" />

        {/* Password Change Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <Label className="text-lg font-medium text-gray-900">Sécurité</Label>
                <p className="text-sm text-gray-600">Gérer votre mot de passe</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              {showPasswordSection ? 'Annuler' : 'Changer le mot de passe'}
            </Button>
          </div>

          {showPasswordSection && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid gap-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Nouveau mot de passe *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      disabled={changingPassword}
                    />
                    <Button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      disabled={changingPassword}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Confirmer le nouveau mot de passe *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      disabled={changingPassword}
                    />
                    <Button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      disabled={changingPassword}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-1">Exigences du mot de passe :</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className={`flex items-center space-x-2 ${passwordData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Au moins 6 caractères</span>
                    </li>
                    <li className={`flex items-center space-x-2 ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>Les mots de passe correspondent</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Mettre à jour le mot de passe
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    variant="outline"
                    disabled={changingPassword}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Ces informations seront utilisées pour personnaliser vos documents PDF générés. 
              Vous ne pouvez modifier votre nom que 2 fois maximum.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;