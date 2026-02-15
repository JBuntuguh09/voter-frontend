import { useEffect, useState } from "react";
import useRequests from "@/app/utils/UseRequests";

export interface PermitZone {
  zone: string;
}

export function useOperatingPermitZones(assemblyId?: string) {
  const { httpAuthGetAsync } = useRequests();
  const [zones, setZones] = useState<PermitZone[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assemblyId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await httpAuthGetAsync(
          `/operating-permit/zones/${assemblyId}`
        );

        // Normalize response
        setZones(res.data || []);
        console.log(res)
      } catch {
        setZones([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [assemblyId]);

  return { zones, loading };
}

export function usePropertyRateZones(assemblyId?: string) {
  const { httpAuthGetAsync } = useRequests();
  const [zones, setZones] = useState<PermitZone[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assemblyId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await httpAuthGetAsync(
          `/property-rate/zones/${assemblyId}`
        );

        // Normalize response
        setZones(res.data || []);
        console.log(res)
      } catch {
        setZones([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [assemblyId]);

  return { zones, loading };
}
