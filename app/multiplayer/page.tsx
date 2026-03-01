"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MultiplayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams?.get('type');
    
    // Redirect to the appropriate debate page
    if (type === 'world-schools') {
      router.push('/world-schools');
    } else if (type === 'british-parliamentary') {
      router.push('/british-parliamentary');
    } else if (type === 'quickfire-clash') {
      router.push('/quickfire-clash');
    } else {
      // Default to home if no type specified
      router.push('/');
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading debate...</p>
      </div>
    </div>
  );
}

export default function MultiplayerPage() {
  return (
    <MultiplayerContent />
  );
}
