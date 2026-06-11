import { db } from "@/lib/db";
import {
  AdminHeader,
  Card,
  Field,
  TextareaField,
  CheckboxField,
  SubmitButton,
  DeleteButton,
} from "@/components/admin-ui";
import { formatMoney } from "@/lib/domain";
import {
  createTicketAction,
  updateTicketAction,
  deleteTicketAction,
} from "../actions";

export default async function AdminTicketsPage() {
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found.</p>;

  const tickets = await db.ticketType.findMany({
    where: { eventId: event.id },
    orderBy: { position: "asc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Tickets"
        description="Pass tiers and pricing. Prices are in whole currency units."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <form action={updateTicketAction} className="space-y-3">
                <input type="hidden" name="id" value={ticket.id} />
                <div className="flex items-center justify-between">
                  <Field label="Name" name="name" defaultValue={ticket.name} required className="flex-1" />
                  <span className="ml-4 mt-5 whitespace-nowrap text-xs text-ink/40">
                    {ticket._count.registrations} sold ·{" "}
                    {formatMoney(ticket.priceCents, ticket.currency)}
                  </span>
                </div>
                <TextareaField label="Description" name="description" defaultValue={ticket.description} rows={2} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Price" name="price" type="number" step="0.01" defaultValue={ticket.priceCents / 100} />
                  <Field label="Currency" name="currency" defaultValue={ticket.currency} />
                  <Field
                    label="Quantity"
                    name="quantity"
                    type="number"
                    defaultValue={ticket.quantity ?? ""}
                    placeholder="∞"
                  />
                  <div className="flex items-end pb-2">
                    <CheckboxField label="Active" name="active" defaultChecked={ticket.active} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <SubmitButton>Save</SubmitButton>
                  <DeleteButton action={deleteTicketAction} id={ticket.id} />
                </div>
              </form>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="font-semibold">Add a ticket type</h2>
          <form action={createTicketAction} className="mt-4 space-y-3">
            <input type="hidden" name="eventId" value={event.id} />
            <Field label="Name" name="name" placeholder="Day Pass" required />
            <TextareaField label="Description" name="description" rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price" name="price" type="number" step="0.01" defaultValue={0} />
              <Field label="Currency" name="currency" defaultValue="EUR" />
            </div>
            <Field label="Quantity (blank = unlimited)" name="quantity" type="number" />
            <CheckboxField label="Active" name="active" defaultChecked />
            <SubmitButton>Add ticket</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
