export function CategoriesSection() {
  const categories: string[] = []
  
  return (
    <section className="border-b border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find hackathons that match your interests and skills
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-12 py-12 text-center">
            <p className="text-muted-foreground">Categories will be loaded here</p>
          </div>
        ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <div
              key={category}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50"
            >
              <p className="text-sm font-medium text-foreground">{category}</p>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
