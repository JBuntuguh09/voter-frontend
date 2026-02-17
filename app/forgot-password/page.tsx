"use client";

import Image from "next/image";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useRequests from "../utils/UseRequests";
import { Label } from "@/components/ui/label";
import { Person } from "../utils/Interface";
import { useRouter } from "next/navigation";

const stepContent = {
  phone: {
    title: "Verify Your Phone Number",
    subtitle:
      "Enter your mobile number to receive a one-time verification code.",
  },
  otp: {
    title: "Enter Verification Code",
    subtitle:
      "We sent a secure 6-digit code to your phone. This helps us confirm your identity.",
  },
  register: {
    title: "Create Your Account",
    subtitle:
      "Set up your credentials to complete registration and secure your access.",
  },
};

type Step = "phone" | "otp" | "register";

export default function OtpFlowPage() {
  const { httpPostAsync } = useRequests();

  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ---------------- AUTO FOCUS WHEN STEP CHANGES ---------------- */
  useEffect(() => {
    if (step === "phone") phoneRef.current?.focus();
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  /* ---------------- PASSWORD STRENGTH ---------------- */
  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = passwordStrength();

  /* ---------------- REQUEST OTP ---------------- */
  const requestOtp = async () => {
    setLoading(true);
    setError("");

    if (phone.trim().length < 10) {
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const res = await httpPostAsync("auth/send-otp", { phone });

      console.log("OTP Response:", res);
      setSelectedPerson(res.data.person);
      setName(`${res.data.person.firstName} ${res.data.person.lastName}`);

      toast.success("OTP sent");
      setStep("otp");
    } catch (e: any) {
      console.error("Failed to send OTP", e);
      toast.error(e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OTP INPUT LOGIC ---------------- */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();

    if (newOtp.every((d) => d !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async (otp: string) => {
    setLoading(true);

    try {
      await httpPostAsync("/otp/validate", {
        personId: selectedPerson?.id,
        token: otp,
      });

      toast.success("OTP verified");
      setStep("register");
    } catch {
      toast.error("Invalid OTP");
      setOtpValues(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- USERNAME ---------------- */
  const generateUsername = () => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const base =
      clean(name.split(" ")[0] || "") + clean(name.split(" ")[1] || "");
    setUsername(`${base}${Math.floor(100 + Math.random() * 900)}`);
  };

  /* ---------------- PASSWORD STRENGTH (PRO) ---------------- */
  function getPasswordStrength(pwd: string) {
    let score = 0;

    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    Object.values(checks).forEach((v) => v && score++);

    let label = "Very Weak";
    let color = "bg-red-500";

    if (score >= 2) {
      label = "Weak";
      color = "bg-orange-500";
    }
    if (score >= 3) {
      label = "Fair";
      color = "bg-yellow-500";
    }
    if (score >= 4) {
      label = "Strong";
      color = "bg-green-500";
    }
    if (score === 5) {
      label = "Very Strong";
      color = "bg-emerald-600";
    }

    return {
      score,
      label,
      color,
      checks,
      percentage: (score / 5) * 100,
    };
  }

  const strengthInfo = getPasswordStrength(password);

  /* ---------------- ANIMATION ---------------- */
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  async function handleCompleteRegistration(
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> {
    event.preventDefault();
    if (loading) return;

    setError("");

    // Basic client-side validation
    if (!selectedPerson) {
      toast.error("No person selected. Please request an OTP first.");
      return;
    }
    if (!email?.trim() || !username?.trim() || !password) {
      toast.error("Please fill in email, username and password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (strengthInfo.score < 3) {
      toast.error("Password is too weak.");
      return;
    }

    setLoading(true);
    try {
      // Adjust endpoint/body to match your backend API
      const payload = {
        firstName: selectedPerson.firstName,
        lastName: selectedPerson.lastName,
        personId: selectedPerson.id,
        email: email.trim(),
        username: username.trim(),
        phoneNumber: selectedPerson.phoneNumber,
        organizationId: selectedPerson.organization?.id || 1, // Default to 1 if not available
        status: "Active",
        createdBy: "Admin",
        updatedBy: "Admin",
        password: password,
        roleId: 2,
      };

      console.log("Registration Payload:", payload);
      await httpPostAsync("auth", payload);

      toast.success("Registration completed");

      // Reset form and go back to phone step (or navigate elsewhere)
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setSelectedPerson(null);
      setOtpValues(Array(6).fill(""));
      setStep("phone");
      router.push("/login");
    } catch (error: any) {
      console.log(error?.response || error);
      const message = error?.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen">
      {/* LEFT IMAGE (HIDDEN MOBILE) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center ">
        <div className="relative w-full h-full">
          <Image
            src="/images/pic_2.png"
            alt="cover"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <main className="flex-1 bg-linear-to-br from-yellow-300 to-green-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{stepContent[step].title}</h1>
            {/* Logo / Crest */}
            <div className="flex justify-center mb-4">
              <div className="w-36 h-36 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                <Image
                  src={"/images/im_logo.jpeg"}
                  alt="logo"
                  width={200}
                  height={200}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stepContent[step].subtitle}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ---------------- PHONE STEP ---------------- */}
            {step === "phone" && (
              <motion.div
                key="phone"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <input
                  disabled={loading}
                  ref={phoneRef}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full border rounded-lg p-3"
                />
                <button
                  disabled={loading}
                  onClick={requestOtp}
                  className="w-full bg-green-700 text-white hover:cursor-pointer hover:bg-green-600 rounded-lg p-3"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </motion.div>
            )}

            {/* ---------------- OTP STEP ---------------- */}
            {step === "otp" && (
              <motion.div
                key="otp"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <p className="text-center text-sm text-gray-500">
                  Enter the 6-digit code
                </p>

                <div className="flex justify-center gap-2">
                  {otpValues.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      className="w-12 h-12 text-center text-lg border rounded-lg"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------------- REGISTER STEP ---------------- */}
            {step === "register" && (
              <motion.div
                key="register"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <Label className="text-xl mb-4">Name: {name}</Label>
                <Label className="text-xl mb-4">
                  Phone: {selectedPerson?.phoneNumber}
                </Label>

                <input
                  placeholder="Email"
                  className="w-full border rounded-lg p-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div>
                  <Label className="flex items-center gap-2">
                    Username
                    <button onClick={generateUsername}>
                      <Shuffle size={16} />
                    </button>
                  </Label>
                  <input
                    className="w-full border rounded-lg p-3"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* PASSWORD */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full border rounded-lg p-3 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Password Strength</span>
                    <span className="font-medium">{strengthInfo.label}</span>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: `${strengthInfo.percentage}%` }}
                    />
                  </div>

                  <ul className="text-xs text-gray-500 space-y-1 mt-2">
                    <li>• At least 8 characters</li>
                    <li>• Upper & lower case letters</li>
                    <li>• At least one number</li>
                    <li>• At least one special character</li>
                  </ul>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full border rounded-lg p-3 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleCompleteRegistration}
                  className="w-full bg-green-700 text-white hover:cursor-pointer hover:bg-green-600 rounded-lg p-3"
                  disabled={loading}
                  //  disabled={loading || password !== confirmPassword || strength < 3}
                >
                  Complete Registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
