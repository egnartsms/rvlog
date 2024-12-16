import * as irel from "irel"


irel.proc(() => {
  irel.add(Fact
    .user(request.currentUser)
    .name("John")
  )

  irel.add(Pred.user.name, {
    user: request.currentUser,
    name: "John"
  })


})


irel.infer(
  $.ticket(v`ticket`).event(v`event`),
  () => $.joinBy([v`order`, v`ol`], [
    $.ticket(v`ticket`).orderline(v`ol`),
    $.orderline(v`ol`).order(v`order`),
    $.order(v`order`).event(v`event`),
  ])
)


irel.infer(
  P.person().aunt(),
  (v) => [
    P.person(v`person`).parent(v`parent`),
    P.person(v`parent`).sibling(v`aunt`),
    P.person(v`aunt`).sex('female'),
  ]
)


P.person.aunt;
P.person.parent;
P.person.sibling;
P.person.sex;


irel.infer(
  P.person(v.Person).sex('male'),
  (v) => [
    P.person(v.Person).name(v.Name),
    irel.satisfies(v.Name, (name) => name.startsWith("John"))
  ]
)
