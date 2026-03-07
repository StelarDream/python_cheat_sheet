export async function loadData() {

    const res = await fetch("data.json");

    return await res.json();

}