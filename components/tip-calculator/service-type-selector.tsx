import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceTypeSelectorProps {
  serviceType: string;
  onServiceTypeChange: (value: string) => void;
}

const serviceTypes = [
  "Restaurant",
  "Food Delivery",
  "Hairstylist/Barber",
  "Taxi/Driver",
  "Hotel Room Service",
  "Other",
];

export function ServiceTypeSelector({
  serviceType,
  onServiceTypeChange,
}: ServiceTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Service Type</Label>
      <Select value={serviceType} onValueChange={onServiceTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select service type" />
        </SelectTrigger>
        <SelectContent>
          {serviceTypes.map((service) => (
            <SelectItem key={service} value={service}>
              {service}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
