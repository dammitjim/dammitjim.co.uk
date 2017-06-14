+++
date = "2016-04-04T16:57:51+01:00"
tags = ["blog"]
title = "Using slices with Go’s pq and SQLx libraries."
image = "img/Go_plus_SQL.png"
image_credit = "https://www.calhoun.io/using-postgresql-with-golang/"

+++


I ran into an interesting problem today when developing a data retrieval service for work<!--more-->. 

Take the following Postgres SQL statement:

```sql
SELECT * FROM people WHERE id = 1;
```

It’s about as simple as it gets, retrieve rows from the `people`  where the person’s identifier is equal to one. This translates into a golang equivalent of:

```go
rows, err := db.Queryx("SELECT * FROM people WHERE id = $1", id)
```
(Using sqlx)

However, what if we need to expand the id matches? The statement would change to:

```sql
SELECT * FROM people WHERE id IN (1, 2, 7);
```

Once again, it appears to be a simple statement, I believed this to translate into golang as follows:

```go
rows, err := db.Queryx("SELECT * FROM people WHERE id IN ($1)", ids)
```

Where ids is a slice of integers, however upon running the program I received this lovely error message:

```bash
converting Exec argument #0's type: unsupported type []int, a slice
```

That’s a worrying one, unsupported type of slice? It seemed like fairly basic functionality to include in a sql library. Upon further investigation I found that the driver I was using ([pq](https://github.com/lib/pq)) utilised Go’s database/sql default [ValueConverter](https://golang.org/pkg/database/sql/driver/#pkg-variables) to understand the parameters. Unfortunately it has no ability whatsoever to handle slices!

Ruh roh.

Further investigation revealed that this is an [ongoing issue](https://github.com/jmoiron/sqlx/issues/106) in the Go database driver world.

My first horrible, hacky solution was to spoof the input array using a joined array of strings:

```go
rows, err := db.Queryx(
	"SELECT * FROM people WHERE id IN ($1)", strings.Join(ids, ", "))
```

However this proved to be a fools errand as it was being interpreted as a string input, rather than sequential integers.

”1, 2, 7” instead of 1, 2, 7: indicating it was interpreting as a string.

That pesky typing! This was going to require a bit more elbow grease.

Postgres allows for an [Array Value Input](http://www.postgresql.org/docs/9.1/static/arrays.html) to be passed in to expressions using the `ANY` function comparison. To a noob like me this appeared to just be a formatted string, ding ding. This alone would not do though, as if we passed in a string it would, as before, interpret it as one. Therefore we have to go a step further and implement the [Valuer](https://golang.org/pkg/database/sql/driver/#Valuer) interface, which is what the ValueConverter (the part that interprets it as a string) spits out, skipping the middleman.

The solution was as follows:

```go
// Int64Array is a type implementing the sql/driver/value interface
// This is due to the native driver not supporting arrays...
type Int64Array []int64

// Value returns the driver compatible value
func (a Int64Array) Value() (driver.Value, error) {
	var strs []string
	for _, i := range a {
		strs = append(strs, strconv.FormatInt(i, 10))
	}
	return "{" + strings.Join(strs, ",") + "}", nil
}
```

Here we create a new type of `Int64Array` and make it conform to the [Valuer](https://golang.org/pkg/database/sql/driver/#Valuer) interface, allowing us to pass it through to a `db.Queryx()` function call as it evaluates our variable as a Valuer which does not need to be converted. Our Go function call then becomes:

```go
rows, err := db.Queryx(
	"SELECT * FROM people WHERE id = ANY ($1)", int64IDs)
```

End result: it worked. Hooray!

Reading into the unsupported slice issue further I found that slices are not natively supported in order to improve
cross-driver support (due to the large syntactic differences between database query engines). It makes sense, but is a bit disappointing.
Go is ultimately a young language in the grand scheme of things so problems like this do happen. However the strength of the interface system has meant that so far I haven’t experienced anything that I’ve been outright unable to solve.

Thank you for reading, I hope it has helped if you are currently encountering this problem.