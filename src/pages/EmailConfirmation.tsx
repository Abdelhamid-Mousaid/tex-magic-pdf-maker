import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmailConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="container mx-auto">
        <div className="max-w-md w-full mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
                  <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-gray-900">
                Vérifiez votre email
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Un lien de confirmation a été envoyé à votre adresse email.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Prochaines étapes :</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Vérifiez votre boîte de réception</li>
                      <li>• Cliquez sur le lien de confirmation</li>
                      <li>• Accédez à votre tableau de bord</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  Vous ne voyez pas l'email ? Vérifiez votre dossier spam ou attendez quelques minutes.
                </p>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour à l'accueil</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;