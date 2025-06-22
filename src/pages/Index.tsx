
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Loader2, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateLatexTemplate } from "@/utils/latexGenerator";

interface UserInfo {
  name: string;
  email: string;
  institution: string;
  level: string;
  chapter: string;
}

const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    institution: "",
    level: "",
    chapter: ""
  });
  const [generatedLatex, setGeneratedLatex] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateLatex = async () => {
    // Validate required fields
    if (!userInfo.name || !userInfo.email || !userInfo.institution || !userInfo.level || !userInfo.chapter) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    console.log("Generating LaTeX with user info:", userInfo);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const latex = generateLatexTemplate(userInfo);
      setGeneratedLatex(latex);
      
      toast({
        title: "LaTeX Generated Successfully",
        description: "Your document is ready for download!",
      });
    } catch (error) {
      console.error("Error generating LaTeX:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your LaTeX document.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadLatex = () => {
    if (!generatedLatex) return;
    
    const blob = new Blob([generatedLatex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your LaTeX file is being downloaded.",
    });
  };

  const handleDownloadPdf = () => {
    toast({
      title: "PDF Generation",
      description: "PDF generation would require a LaTeX compiler service. For now, download the .tex file and compile it with your preferred LaTeX editor.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">LaTeX Magic</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your academic information into professional LaTeX documents with ease
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Document Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Fill in your details to generate a professional LaTeX document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={userInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@institution.edu"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-medium text-gray-700">Institution *</Label>
                <Input
                  id="institution"
                  placeholder="University or Organization"
                  value={userInfo.institution}
                  onChange={(e) => handleInputChange("institution", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium text-gray-700">Academic Level *</Label>
                <Select onValueChange={(value) => handleInputChange("level", value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select your academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="postdoc">Postdoc</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapter" className="text-sm font-medium text-gray-700">Chapter/Section Content *</Label>
                <Textarea
                  id="chapter"
                  placeholder="Enter your chapter content, research abstract, or document body..."
                  value={userInfo.chapter}
                  onChange={(e) => handleInputChange("chapter", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                />
              </div>

              <Button 
                onClick={handleGenerateLatex}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating LaTeX...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Generate LaTeX Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Preview */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Download className="h-6 w-6 mr-2 text-green-600" />
                Generated Output
              </CardTitle>
              <CardDescription className="text-gray-600">
                Preview and download your LaTeX document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedLatex ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {generatedLatex.substring(0, 500)}
                      {generatedLatex.length > 500 && "..."}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleDownloadLatex}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download .tex
                    </Button>
                    <Button
                      onClick={handleDownloadPdf}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <strong>Next Steps:</strong> Download the .tex file and compile it using LaTeX editors like Overleaf, TeXstudio, or MiKTeX to generate your final PDF document.
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Fill out the form and click "Generate LaTeX Document" to see your preview here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Professional Templates</h3>
              <p className="text-gray-600">Generate well-structured LaTeX documents with academic formatting</p>
            </div>
            <div className="space-y-3">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Download</h3>
              <p className="text-gray-600">Download your LaTeX file instantly and compile with your favorite editor</p>
            </div>
            <div className="space-y-3">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Academic Ready</h3>
              <p className="text-gray-600">Perfect for research papers, theses, and academic documentation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
