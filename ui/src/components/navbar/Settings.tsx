import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { ModeToggle } from "../ModeToggle";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

export default function Settings({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <div>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-3 border p-2 rounded">
                <Label className="font-semibold">Change Theme: </Label>
                <ModeToggle />
              </div>
              <div className="border p-2 rounded">
                <Label className="flex gap-1 items-center">
                  <Link href={"/privacy"} target="_blank">
                    Privacy Policy{" "}
                  </Link>
                  <SquareArrowOutUpRight size={14} />
                </Label>
              </div>
            </div>
            {/*<DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>*/}
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
}
