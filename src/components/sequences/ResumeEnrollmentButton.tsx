import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useResumeEnrollment } from "@/hooks/sequences/useAutoPause";

interface Props {
  enrollmentId: string;
  sequenceId: string;
}

export function ResumeEnrollmentButton({ enrollmentId, sequenceId }: Props) {
  const resume = useResumeEnrollment();
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs"
      disabled={resume.isPending}
      onClick={() => resume.mutate({ id: enrollmentId, sequenceId })}
    >
      <Play className="h-3 w-3 mr-1" />
      Retomar
    </Button>
  );
}
