import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface ExtractedTaskData {
  title: string;
  description: string;
  priority: string;
  start_date: string;
  due_date: string;
  category: string | null;
}

interface AITaskCreatorProps {
  onTaskCreated: (extractedData: ExtractedTaskData) => void;
}

export const AITaskCreator = ({ onTaskCreated }: AITaskCreatorProps) => {
  const [script, setScript] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTaskData | null>(
    null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleExtract = async () => {
    if (!script.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch(
        "https://literate-starfish-first.ngrok-free.app/api/extract",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ script }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to extract task data");
      }

      const result = await response.json();
      setExtractedData(result.data.extracted_data);
      setShowConfirmation(true);
    } catch (error) {
      toast.error("Failed to process your request");
      console.error("Error extracting task data:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleExtract();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const resetForm = () => {
    setScript("");
    setExtractedData(null);
    setShowConfirmation(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What do you want to do?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="I want to create a task named 'meeting note' where I can add meeting notes, task recording, and meeting recording. I will start in 2025/07/14 and this task should be completed in 2025/07/20 with high priority. This task is for my personal project."
            className="min-h-[120px] resize-none"
            disabled={isExtracting}
          />
          <Button
            onClick={handleExtract}
            disabled={isExtracting || !script.trim()}
            className="w-full"
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isExtracting ? "Processing..." : "Create Task"}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && extractedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Are you sure you want to create this task?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Title:</span>{" "}
                  {extractedData.title}
                </div>
                <div>
                  <span className="font-medium">Description:</span>{" "}
                  {extractedData.description}
                </div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <span
                    className={`ml-1 capitalize ${
                      extractedData.priority === "high"
                        ? "text-red-600"
                        : extractedData.priority === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {extractedData.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Start Date:</span>{" "}
                  {formatDate(extractedData.start_date)}
                </div>
                <div>
                  <span className="font-medium">Due Date:</span>{" "}
                  {formatDate(extractedData.due_date)}
                </div>
                {extractedData.category && (
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {extractedData.category}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onTaskCreated(extractedData);
                    setShowConfirmation(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
