import { createKysely } from "@vercel/postgres-kysely";

interface Database {
  person: PersonTable;
  pet: PetTable;
  movie: MovieTable;
}

const db = createKysely<Database>();

const person = await db
  .selectFrom('person')
  .innerJoin('pet', 'pet.owner_id', 'person.id')
  .select(['first_name', 'pet.name as pet_name'])
  .where('person.id', '=', id)
  .executeTakeFirst();

export default async (req, res) => {
  try {
    // Perform Kysely queries here
    const result = await person; // Example query
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
