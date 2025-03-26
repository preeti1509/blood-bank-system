import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Donor } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function RecentDonors() {
  const { data: donors, isLoading } = useQuery<Donor[]>({
    queryKey: ['/api/donors'],
    select: (data) => {
      // Sort by last donation date, most recent first
      return [...data].sort((a, b) => {
        if (!a.lastDonation) return 1;
        if (!b.lastDonation) return -1;
        return new Date(b.lastDonation).getTime() - new Date(a.lastDonation).getTime();
      }).slice(0, 4);
    }
  });
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-28" />
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
  
  if (!donors) {
    return null;
  }
  
  // Generate placeholder images for avatar initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const getDonationTimeText = (lastDonation: string | null) => {
    if (!lastDonation) return "Never donated";
    
    const donationDate = new Date(lastDonation);
    const today = new Date();
    const diffTime = today.getTime() - donationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Donated today";
    if (diffDays === 1) return "Donated yesterday";
    if (diffDays < 7) return `Donated ${diffDays} days ago`;
    if (diffDays < 30) return `Donated ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    
    return "Donated " + formatDate(lastDonation);
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-neutral-400">Recent Donors</h3>
          <Link href="/donors">
            <Button variant="link" className="text-secondary p-0 h-auto">
              View All Donors
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {donors.length > 0 ? (
            donors.map(donor => (
              <div key={donor.id} className="flex items-center p-3 border-b border-neutral-200">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-medium">
                  {getInitials(donor.name)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-400">{donor.name}</p>
                  <div className="flex items-center text-xs text-neutral-300">
                    <span className="bg-primary text-white px-1.5 rounded mr-2">{donor.bloodType}</span>
                    <span>{getDonationTimeText(donor.lastDonation)}</span>
                  </div>
                </div>
                <button className="ml-auto p-1 text-secondary">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-300 text-center py-4">
              No donors registered yet
            </p>
          )}
          
          <Link href="/donors/new">
            <Button 
              variant="outline" 
              className="w-full text-secondary border-secondary hover:bg-secondary/5"
            >
              Register New Donor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
