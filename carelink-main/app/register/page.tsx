"use client";

import React from "react";
import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  // const initialState = {
  //   formFields: {
  //     email: "",
  //     password: "",
  //   },
  //   error: "",
  // };

  // const [formState, formAction, isPending] = useActionState(
  //   createUser,
  //   initialState
  // );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        <p className="text-center text-lg font-semibold mb-4">
          Sign up to find available daycares and track your applications in real
          time
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-3 py-2 border rounded"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-3 py-2 border rounded"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="w-full px-3 py-2 border rounded"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <div className="flex items-start gap-2 text-sm">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <label htmlFor="privacy-consent" className="select-none">
              I agree to the{" "}
              <a href="/privacy" className="text-primary underline">
                Privacy Policy
              </a>{" "}
              and consent to the processing of my personal data.
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 font-bold text-primary-foreground bg-primary rounded hover:bg-primary/90 disabled:opacity-50"
            disabled={!consent}
          >
            Sign up
          </button>
        </form>
        <div className="my-6">
          <div className="flex items-center mb-4">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-sm font-medium">
              Or continue with
            </span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <div className="flex justify-center gap-4 mb-2">
            <button
              className="p-3 rounded-full border hover:bg-gray-100 shadow-sm"
              aria-label="Sign up with Google"
            >
              <FcGoogle size={28} />
            </button>
            <button
              className="p-3 rounded-full border hover:bg-gray-100 text-primary shadow-sm"
              aria-label="Sign up with Facebook"
            >
              <FaFacebook size={26} />
            </button>
            <button
              className="p-3 rounded-full border hover:bg-gray-100 text-black shadow-sm"
              aria-label="Sign up with Apple"
            >
              <FaApple size={26} />
            </button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
