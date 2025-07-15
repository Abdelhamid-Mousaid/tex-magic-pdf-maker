import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SemesterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSemesterSelected: (semester: string) => void;
  levelName?: string;
}

export function SemesterSelectionModal({ 
  isOpen, 
  onClose, 
  onSemesterSelected, 
  levelName 
}: SemesterSelectionModalProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const semesters = [
    {
      id: "1er_semestre",
      name: "1er Semestre",
      description: "Chapitres 1-5 du premier semestre"
    },
    {
      id: "2eme_semestre", 
      name: "2ème Semestre",
      description: "Chapitres 1-5 du deuxième semestre"
    }
  ];

  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
  };

  const handleContinue = () => {
    if (selectedSemester) {
      onSemesterSelected(selectedSemester);
      setSelectedSemester("");
    }
  };

  const handleClose = () => {
    setSelectedSemester("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sélectionner le Semestre</DialogTitle>
          {levelName && (
            <p className="text-muted-foreground">
              Niveau: {levelName}
            </p>
          )}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {semesters.map((semester) => (
            <Card 
              key={semester.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedSemester === semester.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSemesterSelect(semester.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{semester.name}</CardTitle>
                <CardDescription>{semester.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  5 chapitres disponibles
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedSemester}
          >
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}