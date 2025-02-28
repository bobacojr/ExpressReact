"use client"
import React, { useEffect, useState } from "react";
import Navbar from "./(components)/navbar/page";
import Products from '@/app/products/page';
import axios from './(components)/axiosConfig';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:8080/auth/me");
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Authentication check failed, please login");
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex w-screen h-screen justify-center overflow-x-hidden">
        <div className="fixed top-0 left-0 w-full z-20">
          <Navbar />
        </div>
        <div className="flex w-full mt-24">
          <Products />
        </div>
    </div>
  );
}
