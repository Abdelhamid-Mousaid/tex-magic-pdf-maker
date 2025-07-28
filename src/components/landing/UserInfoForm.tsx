import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, User, School, Mail, CalendarDays } from 'lucide-react';

interface UserInfo {
  email: string;
  fullName: string;
  schoolName: string;
  academicYear: string;
  date: string;
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  isLoading?: boolean;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<UserInfo>({
    email: '',
    fullName: '',
    schoolName: '',
    academicYear: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  const validateForm = () => {
    const newErrors: Partial<UserInfo> = {};
    
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    if (!formData.fullName) newErrors.fullName = 'Nom complet requis';
    if (!formData.schoolName) newErrors.schoolName = 'Nom de l\'école requis';
    if (!formData.academicYear) newErrors.academicYear = 'Année scolaire requise';
    if (!formData.date) newErrors.date = 'Date requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-gradient-to-br from-card to-accent/5">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          Informations Personnelles
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Remplissez vos informations pour commencer
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="votre.email@exemple.com"
              className={`transition-all ${errors.email ? 'border-destructive' : 'focus:border-primary'}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Nom complet */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Nom complet *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Prénom et Nom"
              className={`transition-all ${errors.fullName ? 'border-destructive' : 'focus:border-primary'}`}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* Nom de l'école */}
          <div className="space-y-2">
            <Label htmlFor="schoolName" className="text-sm font-medium flex items-center gap-2">
              <School className="h-4 w-4" />
              Nom de l'école *
            </Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="Nom de votre établissement"
              className={`transition-all ${errors.schoolName ? 'border-destructive' : 'focus:border-primary'}`}
            />
            {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Année scolaire */}
            <div className="space-y-2">
              <Label htmlFor="academicYear" className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Année scolaire *
              </Label>
              <Input
                id="academicYear"
                value={formData.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                placeholder="2024-2025"
                className={`transition-all ${errors.academicYear ? 'border-destructive' : 'focus:border-primary'}`}
              />
              {errors.academicYear && <p className="text-xs text-destructive">{errors.academicYear}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`transition-all ${errors.date ? 'border-destructive' : 'focus:border-primary'}`}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-3 mt-6 transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? 'Validation...' : 'Continuer vers la sélection'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserInfoForm;