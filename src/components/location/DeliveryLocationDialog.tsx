import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUserAddress } from "@/api/user/getUsers";
import UserAddressCard from "@/components/location/UserAddressCard";
import { useUserAddressStore } from "@/store/userAddressStore";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, LocateFixed, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { useProductUser } from "@/store/productUserStore";
import { getDetailAddress } from "@/api/common/getLocation";
import { UserAddress } from "@/types/models/users";
import { cn } from "@/lib/utils";

const DeliveryLocationDialog: FC = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedUserAddressId, setSelectedUserAddressId] = useState<number>();
  const [currentUserLocation, setCurrentUserLocation] = useState<UserAddress>();
  const { userAddress, setUserAddress } = useUserAddressStore();
  const { data } = useSession();
  const { setProductPage } = useProductUser();

  const { data: userAddresses } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: getUserAddress,
    enabled: !!data?.accessToken,
  });

  const handleOnSubmit = () => {
    const selectedDetailAddress = userAddresses?.data.find(
      (userAddress) => userAddress.id === selectedUserAddressId,
    );

    if (
      selectedUserAddressId &&
      currentUserLocation &&
      selectedUserAddressId < 0
    ) {
      setDialogOpen(false);
      return setUserAddress(currentUserLocation);
    }

    if (selectedDetailAddress) {
      setUserAddress(selectedDetailAddress);
      setProductPage(0);
      toast({
        title: "Delivery Address Changed",
        description: `Location changed to ${selectedDetailAddress.name}`,
        duration: 2000,
      });
    }
    setDialogOpen(false);
  };

  const handleOpenChange = (val: boolean) => {
    setDialogOpen(val);
    if (userAddress?.id) {
      setSelectedUserAddressId(userAddress.id);
    }
    if (userAddresses && !userAddress) {
      const primaryAddressId = userAddresses?.data.find(
        (userAddress) => userAddress.primary === true,
      )?.id;

      setSelectedUserAddressId(primaryAddressId);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          getDetailAddress(location).then((value) => {
            const currentUserAddress: UserAddress = {
              id: -1,
              name: "Current Location",
              detailAddress: value.display_name,
              longitude: Number(value.lon),
              latitude: Number(value.lat),
            };
            setCurrentUserLocation(currentUserAddress);
            toast({
              title: "Location detected",
              description: value.name,
              duration: 3000,
            });
          });

          return;
        },
        () => {
          toast({
            title: "Error",
            description: "Unable to get your location. Please try again.",
            variant: "destructive",
            duration: 3000,
          });
        },
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(val) => handleOpenChange(val)}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-2">
          <span className="text-sm text-gray-600">
            {userAddress ? userAddress?.name : "Select Delivery Address"}
          </span>
          <ChevronDown size={15} className="text-gray-400" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg p-4 sm:max-w-[500px] sm:p-6">
        <DialogHeader className={"pt-5 md:pt-0"}>
          <DialogTitle>Select Delivery Address</DialogTitle>
          <DialogDescription>
            Product showcase will be based on this selection
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 w-full p-3">
          <div className="flex flex-col gap-3">
            <div
              className={cn(
                "flex w-full flex-col gap-2 rounded-lg border-2 px-4 py-2 md:max-h-24",
                selectedUserAddressId === -1
                  ? "cursor-default border-warehub-green bg-green-50"
                  : "cursor-pointer border-gray-200 bg-white",
              )}
              onClick={() => {
                setSelectedUserAddressId(-1);
                if (!currentUserLocation) {
                  getCurrentLocation();
                }
              }}
            >
              <div className="flex gap-2">
                <LocateFixed className="text-gray-800" />
                <div className="flex w-full justify-between">
                  <h2 className="font-semibold">Use Current Location</h2>
                  {currentUserLocation && (
                    <RotateCcw
                      className="cursor-pointer"
                      onClick={getCurrentLocation}
                    />
                  )}
                </div>
              </div>

              {currentUserLocation && (
                <p className="overflow-hidden text-ellipsis text-sm text-gray-700">
                  {currentUserLocation?.detailAddress}
                </p>
              )}
            </div>

            {userAddresses &&
              userAddresses.data.map((userAddress) => (
                <div
                  onClick={() => setSelectedUserAddressId(userAddress.id)}
                  key={`user-address-selected-${userAddress.id}`}
                >
                  <UserAddressCard
                    id={userAddress.id}
                    name={userAddress.name}
                    detailAddress={userAddress.detailAddress}
                    primary={userAddress.primary}
                    isSelected={selectedUserAddressId === userAddress.id}
                  />
                </div>
              ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={handleOnSubmit}
            disabled={!selectedUserAddressId}
            className="max-w-[50%]"
          >
            Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryLocationDialog;
