import { Button } from "@/components/ui/button";
import  TarjetaProducto  from "@/components/TarjetaProducto";
import AppLayout from '@/layouts/renova-layout';

export default function Welcome() {
  return (
    <AppLayout>
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <TarjetaProducto />
            </div>
        </div>
    </AppLayout>
  );
}
