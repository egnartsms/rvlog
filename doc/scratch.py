@rv.infer(Family(v.family, husband=v.hus, wife=v.wife, child=v.child))
def _(family, hus: Person, wife: Person, child: Person):
    yield child.parent == hus
    yield hus.sex == "male"
    yield child.parent == wife
    yield wife.sex == "female"
    yield family == Family.new(hus, wife)


@rv.infer(v.family.wife == v.wife)
def _(family: Family, wife: Person):
    pass


# Usage:

fam = Family(v.fam)
yield fam.wife == joan
fam.husband == some_result
...

