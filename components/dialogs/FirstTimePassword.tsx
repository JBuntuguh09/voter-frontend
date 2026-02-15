"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useRequests from "@/app/utils/UseRequests";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UpdatePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  apiEndpoint: string;
  authToken: string;
  currentPassword: string;
  userId: string;
  onSubmit: (password: string) => void;
}

type Strength = "Weak" | "Medium" | "Strong";

export default function UpdatePasswordDialog({
  open,
  onClose,
  apiEndpoint,
  authToken,
  currentPassword,
  userId,
  onSubmit
}: UpdatePasswordDialogProps) {
    const { httpAuthPutAsync} = useRequests()
    const router = useRouter()
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getStrength = (value: string): Strength => {
    let score = 0;
    if (value.length >= 6) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;

    if (score <= 1) return "Weak";
    if (score === 2 || score === 3) return "Medium";
    return "Strong";
  };

  const validatePassword = (value: string) => {
    const errors: string[] = [];

    if (value.length < 6) errors.push("At least 6 characters");
    if (!/[A-Z]/.test(value)) errors.push("One capital letter");
    if (!/[0-9]/.test(value)) errors.push("One number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
      errors.push("One special character");

    return errors;
  };

  const passwordErrors = validatePassword(password);
  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

  const canSubmit =
    passwordErrors.length === 0 && passwordsMatch && !loading;

  const strength = getStrength(password);

  const strengthColor =
    strength === "Weak"
      ? "bg-red-500"
      : strength === "Medium"
      ? "bg-yellow-500"
      : "bg-green-500";

  const strengthWidth =
    strength === "Weak"
      ? "w-1/3"
      : strength === "Medium"
      ? "w-2/3"
      : "w-full";

  const submitPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      alert("Password update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    //const err = validate();
    //if (err) return toast.error(err);

    setLoading(true);

    const payload = {
      currentPassword: currentPassword,
      newPassword: password|| undefined,
      firstLoginDateTime: new Date()
      
    };

    try {
        console.log(payload)
      const res = await httpAuthPutAsync(
        `auth/${userId}`,
        payload
      );

    
      onSubmit(password)
      onClose();
      

      
    } catch(error:any) {
      console.log(error)
      toast.error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-lg font-semibold">
                Password Updated Successfully
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account is now secured.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-center mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl font-semibold">
                  Welcome to Cohoe Smart City
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground">
                  As a new user, please update your password to secure your
                  account before continuing.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                {/* Password */}
                <div className="space-y-1">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((p) => !p)
                      }
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  <div className="space-y-1 pt-2">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all ${strengthColor} ${strengthWidth}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength:{" "}
                      <span className="font-medium">
                        {strength}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />
                </div>

                {/* Validation Messages */}
                <div className="space-y-1 text-sm">
                  {passwordErrors.map((err, index) => (
                    <p
                      key={index}
                      className="text-destructive"
                    >
                      • {err}
                    </p>
                  ))}
                  {confirmPassword.length > 0 &&
                    !passwordsMatch && (
                      <p className="text-destructive">
                        • Passwords do not match
                      </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full rounded-xl"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
