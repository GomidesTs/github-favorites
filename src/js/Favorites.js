import { GithubUser } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || []
    }

    save(){
        localStorage.setItem('@github-favorites', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExissts = this.entries.find(entry => entry.login === username)
            if(userExissts)
            {
                throw new Error(`Usuario ${username} ja cadastrado`)
            }
            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error(`Usuario "${username}" nao encontrado`)
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch (error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntrires = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntrires

        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const {
                value
            } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    update() {
        this.removeAllTr()
        this.entries.forEach(item => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${item.login}.png`
            row.querySelector('.user img').alt = `Foto de perfil de ${item.name}`
            row.querySelector('.user a').href = `https://github.com/${item.login}`
            row.querySelector('.user p').textContent = item.name
            row.querySelector('.user span').textContent = item.login
            row.querySelector('.repositories').textContent = item.public_repos
            row.querySelector('.followers').textContent = item.followers
            row.querySelector('.remove').onclick = () => {
                const isOk = confirm(`Tem certeza que deseja remover ${item.login} de seus favoritos`)

                if (isOk) {
                    this.delete(item)
                }
            }
            this.tbody.append(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <td class="user">
        <img>
        <a target="_blank" rel="noopener noreferrer">
            <p></p>
            <span></span>
        </a>
        </td>
        <td class="repositories"></td>
        <td class="followers"></td>
        <td>
            <button class="remove">&times;</button>
        </td>
        `
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((item) => {
            item.remove()
        })
    }
}