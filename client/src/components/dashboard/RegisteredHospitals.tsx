import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Hospital } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegisteredHospitals() {
  const { data: hospitals, isLoading } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center p-3 border-b border-neutral-200">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-6 ml-auto" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!hospitals) {
    return null;
  }
  
  // Take only the first 4 hospitals for the dashboard preview
  const displayHospitals = hospitals.slice(0, 4);
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-neutral-400">Registered Hospitals</h3>
          <Link href="/hospitals">
            <Button variant="link" className="text-secondary p-0 h-auto">
              View All
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {displayHospitals.length > 0 ? (
            displayHospitals.map(hospital => (
              <div key={hospital.id} className="flex items-center p-3 border-b border-neutral-200">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="material-icons text-secondary">local_hospital</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-400">{hospital.name}</p>
                  <p className="text-xs text-neutral-300">{hospital.city}</p>
                </div>
                <button className="ml-auto p-1 text-secondary">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-300 text-center py-4">
              No hospitals registered yet
            </p>
          )}
          
          <Link href="/hospitals/new">
            <Button 
              variant="outline" 
              className="w-full text-secondary border-secondary hover:bg-secondary/5"
            >
              Register New Hospital
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
