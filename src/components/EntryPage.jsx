import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { supabase } from "../supabaseClient"; // Adjust path if needed

export default function EntryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showExitFormButton, setShowExitFormButton] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateOut(true), 1000);
    const timer2 = setTimeout(() => setLoading(false), 2000);

    const checkStatus = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Logged in user:", user);

      // Check admin role
      const { data: roleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleData?.role === "admin" || roleData?.role === "superadmin") {
        setShowAdminButton(true);
      }

      // Check applicant status using email and maybeSingle
      const { data: applicant, error: appError } = await supabase
        .from("applicants")
        .select("status")
        .eq("id", user.id)
        .single();

      if (appError) console.warn("Applicants error:", appError.message);

      const status = applicant?.status;
      console.log("User status:", status);

      if (status?.toLowerCase() === "leaving_pending") {
        setShowExitFormButton(true);
      }
    };

    checkStatus();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleOption = (answer) => {
    navigate(answer === "recruit" ? "/recruitment" : "/admin-login");
  };

  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
    background: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg",
    tiktok: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//TikTok.png",
    twitter: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//Twitter%20New%20X%20Logo%20Icons-08.png",
    facebook: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//Facebook.png",
    youtube: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//youtube.png",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-800 via-black to-purple-800">
        <div className="text-center">
          <img
            src={assets.logo}
            alt="Obscura Logo"
            className={`mx-auto w-32 md:w-48 lg:w-56 ${animateOut ? "animate-door-open" : ""}`}
          />
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-purple-200 mt-4 shadow-lg ${animateOut ? "animate-fade-up" : ""}`}
          >
            Welcome to Obscura
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white px-4 before:absolute before:inset-0 before:bg-purple-900/60 before:z-0 before:animate-fade"
      style={{ backgroundImage: `url('${assets.background}')` }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={assets.logo}
          alt="Obscura Logo"
          className="w-48 md:w-64 lg:w-72 mb-6 drop-shadow-xl animate-bounce"
        />
        <p className="text-lg md:text-xl mb-6 bg-black/50 p-4 rounded-lg shadow-md">
          Are you here to be recruited or are you an admin?
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => handleOption("recruit")}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 px-6 py-3 rounded-lg shadow-lg font-semibold transition-transform duration-200 transform hover:scale-105"
          >
            I'm being recruited
          </button>

          {showAdminButton && (
            <button
              onClick={() => handleOption("admin")}
              className="bg-gray-700 hover:bg-gray-600 active:scale-95 px-6 py-3 rounded-lg shadow-lg font-semibold transition-transform duration-200 transform hover:scale-105"
            >
              I'm an admin
            </button>
          )}

          {showExitFormButton && (
            <button
              onClick={() => navigate("/exitform")}
              className="bg-green-600 hover:bg-green-700 active:scale-95 px-6 py-3 rounded-lg shadow-lg font-semibold transition-transform duration-200 transform hover:scale-105"
            >
              Exit Form
            </button>
          )}
        </div>

        <div className="relative w-full max-w-3xl">
          <div className="hidden md:flex flex-col gap-4 absolute left-4 top-0 bottom-0 justify-center z-10">
            <a href="https://www.tiktok.com/@obscura_e_sports?_t=8r4yZXkvp6E&_r=1" target="_blank" rel="noopener noreferrer">
              <img src={assets.tiktok} alt="TikTok" className="w-8 md:w-10 hover:scale-110 transition" />
            </a>
            <a href="https://x.com/Obscuraesports" target="_blank" rel="noopener noreferrer">
              <img src={assets.twitter} alt="Twitter" className="w-8 md:w-10 hover:scale-110 transition" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61566312790023" target="_blank" rel="noopener noreferrer">
              <img src={assets.facebook} alt="Facebook" className="w-8 md:w-10 hover:scale-110 transition" />
            </a>
            <a href="https://www.youtube.com/@ObscuraEsports" target="_blank" rel="noopener noreferrer">
              <img src={assets.youtube} alt="YouTube" className="w-8 md:w-10 hover:scale-110 transition" />
            </a>
          </div>

          <ReactPlayer
            url="https://www.youtube.com/watch?v=PyfPbCRWL2Y"
            playing
            loop
            muted
            controls={false}
            width="100%"
            height="360px"
            className="rounded-xl shadow-2xl"
          />

          <div className="flex md:hidden justify-center gap-6 mt-4">
            <img src={assets.tiktok} alt="TikTok" className="w-8 hover:scale-110 transition" />
            <img src={assets.twitter} alt="Twitter" className="w-8 hover:scale-110 transition" />
            <img src={assets.facebook} alt="Facebook" className="w-8 hover:scale-110 transition" />
            <img src={assets.youtube} alt="YouTube" className="w-8 hover:scale-110 transition" />
          </div>
        </div>
      </div>
    </div>
  );
}
