
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookOpen, FileText, Users, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const LandingPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast({
            title: "Erreur",
            description: "Veuillez entrer votre nom complet.",
            variant: "destructive"
          });
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Inscription réussie!",
            description: "Vérifiez votre email pour confirmer votre compte.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">Math Planner</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Générez automatiquement vos documents LaTeX professionnels adaptés au système éducatif marocain. 
            Spécialement conçu pour les professeurs de mathématiques du collège et lycée au Maroc.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Système Éducatif Marocain</h3>
                  <p className="text-gray-600">Documents adaptés aux programmes du collège et lycée marocain</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">De la 1APIC au 2BAC</h3>
                  <p className="text-gray-600">Tous les niveaux du système marocain : collège et lycée</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Plans Flexibles</h3>
                  <p className="text-gray-600">Premier semestre, deuxième semestre ou année complète</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-3">
                "Enfin un outil adapté au système marocain ! Math Planner m'aide énormément pour créer des documents professionnels pour mes classes de 2BAC."
              </p>
              <p className="text-sm text-gray-600">- Ahmed B., Professeur de Mathématiques, Casablanca</p>
            </div>
          </div>

          {/* Auth Form */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-900">
                {isSignUp ? 'Créer un Compte' : 'Se Connecter'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isSignUp 
                  ? 'Commencez avec votre plan gratuit aujourd\'hui' 
                  : 'Connectez-vous à votre compte'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Nom Complet *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Votre nom complet"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Adresse Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de Passe *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                >
                  {loading ? (
                    'Chargement...'
                  ) : (
                    <>
                      {isSignUp ? 'Créer mon Compte' : 'Se Connecter'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />
              
              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp 
                    ? 'Déjà un compte ? Se connecter' 
                    : 'Pas de compte ? S\'inscrire'
                  }
                </button>
              </div>

              {isSignUp && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Plan Gratuit Inclus</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Accès immédiat au premier chapitre pour tous les niveaux
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
