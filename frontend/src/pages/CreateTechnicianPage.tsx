import { useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCreateTechnician } from "@/features/technicians/api/use-technicians";
import type { CreateTechnicianValues } from "@/features/technicians/types";

const technicianSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z.string().trim().email("Enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .regex(/^[+]?[0-9 ()-]+$/, "Enter a valid phone number"),

  skills: z.string().max(2000, "Skills must not exceed 2000 characters"),

  serviceArea: z
    .string()
    .max(200, "Service area must not exceed 200 characters"),
});

function CreateTechnicianPage() {
  const navigate = useNavigate();
  const createMutation = useCreateTechnician();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTechnicianValues>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      skills: "",
      serviceArea: "",
    },
  });

  async function onSubmit(values: CreateTechnicianValues) {
    setServerError(null);

    try {
      await createMutation.mutateAsync(values);
      navigate("/technicians");
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create technician",
        );
      } else {
        setServerError("Unable to create technician");
      }
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          to="/technicians"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to technicians
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">Technicians</p>

        <h1 className="mt-1 text-3xl font-bold text-white">Add technician</h1>

        <p className="mt-2 text-slate-400">
          Create a technician account and service profile.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Account details</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Full name"
                placeholder="Amit Shah"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Phone number"
                type="tel"
                placeholder="+91 9876500000"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                label="Email"
                type="email"
                placeholder="amit@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Temporary password"
                type="password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Service area"
                placeholder="Dhrangadhra"
                error={errors.serviceArea?.message}
                {...register("serviceArea")}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-slate-200"
              >
                Skills
              </label>

              <textarea
                id="skills"
                rows={4}
                placeholder="RO repair, AC servicing, electrical work"
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                {...register("skills")}
              />

              {errors.skills && (
                <p className="text-sm text-red-400">{errors.skills.message}</p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {serverError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/technicians"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
              >
                {isSubmitting || createMutation.isPending
                  ? "Creating..."
                  : "Create technician"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default CreateTechnicianPage;
