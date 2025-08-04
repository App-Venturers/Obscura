import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { supabase } from "../supabaseClient";
import NavigationBar from "./NavigationBar";
import GradientButton from "./GradientButton";

export default function EntryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showExitFormButton, setShowExitFormButton] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateOut(true), 1000);
    const timer2 = setTimeout(() => setLoading(false), 2000);

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRecord, error } = await supabase
        .from("users")
        .select("role, status, full_name, dob")
        .eq("id", user.id)
        .single();

      if (error || !userRecord) {
        console.warn("Unable to fetch user data:", error?.message);
        return;
      }

      const { role, status, full_name, dob } = userRecord;

      if (["admin", "superadmin"].includes(role)) {
        setShowAdminButton(true);
      }

      if (status?.toLowerCase() === "leaving_pending") {
        setShowExitFormButton(true);
      }

      if (full_name && dob) {
        setFormCompleted(true);
      }
    };

    checkUser();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleOption = (answer) => {
    if (answer === "recruit") navigate("/recruitment");
    if (answer === "admin") navigate("/admin-login");
  };

  const assets = {
    logo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//ObscuraLogo.png",
    background: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//wallpaperflare.com_wallpaper%20(57).jpg",
    tiktok: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//TikTok.png",
    twitter: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//Twitter%20New%20X%20Logo%20Icons-08.png",
    facebook: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//Facebook.png",
    youtube: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//youtube.png",
    grizzlyPromo: "https://tccglukvhjvrrjkjshet.supabase.co/storage/v1/object/public/public-assets//Obscura%20X%20Grizzly%20Background%20950x290.png"
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
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-purple-200 mt-4 shadow-lg ${animateOut ? "animate-fade-up" : ""}`}>
            Welcome to Obscura
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start text-white px-4 before:absolute before:inset-0 before:bg-purple-900/60 before:z-0 before:animate-fade"
      style={{ backgroundImage: `url('${assets.background}')` }}
    >
      <div className="relative z-10 flex flex-col items-center w-full">
        <NavigationBar />

        <img
          src={assets.logo}
          alt="Obscura Logo"
          className="w-48 md:w-64 lg:w-72 my-6 drop-shadow-xl animate-bounce"
        />

        <p className="text-lg md:text-xl mb-6 bg-black/50 p-4 rounded-lg shadow-md">
          Welcome back! What would you like to do?
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-4xl w-full px-4">
          {!formCompleted && (
            <GradientButton onClick={() => handleOption("recruit")} className="w-full sm:w-auto min-w-[200px] text-center">
              I'm being recruited
            </GradientButton>
          )}

          {formCompleted && (
            <>
              <GradientButton onClick={() => navigate("/refer")} className="w-full sm:w-auto min-w-[200px] text-center">
                I want to Refer someone
              </GradientButton>

              <GradientButton onClick={() => navigate("/update-details")} className="w-full sm:w-auto min-w-[200px] text-center">
                I want to update my Details
              </GradientButton>

              <GradientButton onClick={() => navigate("/hr-support")} className="w-full sm:w-auto min-w-[200px] text-center">
                Log an HR Support Ticket
              </GradientButton>
            </>
          )}

          {showAdminButton && (
            <GradientButton onClick={() => handleOption("admin")} className="w-full sm:w-auto min-w-[200px] text-center">
              I'm an admin
            </GradientButton>
          )}

          {showExitFormButton && (
            <GradientButton onClick={() => navigate("/exitform")} className="w-full sm:w-auto min-w-[200px] text-center">
              Exit Form
            </GradientButton>
          )}
        </div>

        <div className="relative w-full max-w-3xl">
          <div className="hidden md:flex flex-col gap-4 absolute left-4 top-0 bottom-0 justify-center z-10">
            {["tiktok", "twitter", "facebook", "youtube"].map((platform) => (
              <a
                key={platform}
                href={
                  platform === "tiktok"
                    ? "https://www.tiktok.com/@obscura_e_sports?_t=8r4yZXkvp6E&_r=1"
                    : platform === "twitter"
                    ? "https://x.com/Obscuraesports"
                    : platform === "facebook"
                    ? "https://www.facebook.com/profile.php?id=61566312790023"
                    : "https://www.youtube.com/@ObscuraEsports"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={assets[platform]}
                  alt={platform}
                  className="w-8 md:w-10 hover:scale-110 transition"
                />
              </a>
            ))}
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
            {["tiktok", "twitter", "facebook", "youtube"].map((platform) => (
              <img
                key={platform}
                src={assets[platform]}
                alt={platform}
                className="w-8 hover:scale-110 transition"
              />
            ))}
          </div>
        </div>

        {/* Grizzly x Obscura Promo Image */}
        <div className="mt-16 mb-10 flex justify-center w-full px-4">
  <a href="https://grizzlyenergy.co.za/" target="_blank" rel="noopener noreferrer">
    <img
      src={assets.grizzlyPromo}
      alt="Obscura x Grizzly"
      className="w-full max-w-3xl rounded-xl shadow-2xl transition hover:scale-105 hover:shadow-pink-500/40"
    />
  </a>
</div>
      </div>
    </div>
  );
}
