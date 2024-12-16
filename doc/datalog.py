import irel
from irel import v

DB = irel.Database()


irel.infer(
    DB.event(v.Event).ticket(v.Ticket),
    when=irel.and_(
        DB.event(v.Event).order(v.Order),
        DB.order(v.Order).orderline(v.Orderline),
        DB.orderline(v.Orderline).ticket(v.Ticket),
    )
)


def is_product_sold_at(product, sale, date):
    pass


@method_for(Order)
def subtotal(order: Order) -> Amount:
    ol = irel.each_from(order.orderlines).filter(~_x.product.is_sold_out)
    return irel.sum_of(ol.quantity * ol.product.price)


@method_for(Ticket)
def transfer_end(ticket: Ticket) -> Ticket:
    return ticket.target_ticket.when(
        is_none,
        then=ticket,
        otws=ticket.target_ticket.transfer_end
    )


irel.fact(DB.product_id(product.id).sold_at(transfer_sale).at(date.today()))

irel.infer(
    DB.product(v.Prod).sold_at(v.Sale).at(v.Date),
    when=irel.and_(
        SQL.prd_product_sale_settings(product_id=v.Prod.id, sale_id=v.Sale.id),
        SQL.prd_product(id=v.Prod.id, sale_start, sale_end),
        ...
    )
)
