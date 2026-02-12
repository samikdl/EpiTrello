# 📘 Documentation Technique - Sprint 1 : EpiTrello

**Projet :** EpiTrello  
**Étudiant :** Sami Kandil  
**Technologies :** Spring Boot 3, PostgreSQL, React + TypeScript

---

## 1. 🎯 Objectifs du Sprint 1

Ce sprint se concentrait sur la mise en place du socle technique et des premières briques fonctionnelles :

* Mise en place de l'environnement (Docker, Base de données)
* Conception et création du modèle de données (Users, Boards, Lists, Cards)
* Développement des premières API (Backend)
* Bonus : Mise en place d'un Frontend moderne pour valider la connexion

---

## 2. ⚙️ Environnement & Infrastructure

### 2.1 Docker Compose (`docker-compose.yml`)

Configuration du conteneur de base de données PostgreSQL et de l'interface d'administration Adminer.

*Note : Le port PostgreSQL a été mappé sur **5433** pour éviter les conflits locaux.*

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    container_name: epitrello-db
    environment:
      POSTGRES_DB: epitrello
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  adminer:
    image: adminer
    container_name: epitrello-adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: db

volumes:
  db_data:
```

### 2.2 Configuration Spring Boot (`application.properties`)

Paramétrage de la connexion BDD et du port serveur.

```properties
spring.application.name=epitrello

# Connexion au port 5433 défini dans Docker
spring.datasource.url=jdbc:postgresql://localhost:5433/epitrello
spring.datasource.username=admin
spring.datasource.password=password

# Force le dialecte PostgreSQL pour éviter les erreurs de détection
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Mise à jour automatique du schéma BDD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Le Backend tourne sur le port 8081
server.port=8081
```

---

## 3. 🗄 Modèle de Données (Backend)

Conformément au cahier des charges, 4 entités ont été créées.

### 3.1 Schéma Relationnel (Généré par Hibernate)

* **Users** : id, username, email, password
* **Boards** : id, name, user_id (Liaison ManyToOne vers User)
* **Lists** : id, title, position, board_id (Liaison ManyToOne vers Board)
* **Cards** : id, title, description, position, list_id (Liaison ManyToOne vers List)

### 3.2 Code des Entités (Extraits clés)

#### User.java

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    private String email;
    private String password;
    
    // Getters & Setters...
}
```

#### Board.java

```java
@Entity
@Table(name = "boards")
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // Getters & Setters...
}
```

#### TaskList.java (Lists)

```java
@Entity
@Table(name = "lists")
public class TaskList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private Integer position;
    
    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    @JsonIgnore
    private Board board;
    
    // Getters & Setters...
}
```

#### Card.java

```java
@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "list_id", nullable = false)
    @JsonIgnore
    private TaskList taskList;
    
    // Getters & Setters
}
```

---

## 4. 📡 API REST (Contrôleurs)

Les endpoints suivants ont été implémentés pour gérer l'authentification et les tableaux.

### AuthController.java

* **POST /auth/register** : Crée un nouvel utilisateur
* **POST /auth/login** : Vérifie les identifiants et retourne l'utilisateur

*Note : Ajout de @CrossOrigin pour autoriser le frontend React.*

### BoardController.java

* **GET /boards** : Liste tous les tableaux
* **POST /boards** : Crée un nouveau tableau

---

## 5. 💻 Frontend (React + Tailwind)

Une interface moderne a été développée pour tester l'authentification visuellement.

### 5.1 Stack Technique

* **Framework** : Vite + React + TypeScript
* **Style** : Tailwind CSS
* **Icônes** : Lucide React

### 5.2 Fonctionnalités implémentées

* **Page de Connexion / Inscription** : Formulaire switchable, gestion des erreurs API
* **Dashboard Utilisateur** : Affichage après connexion réussie, bouton de déconnexion
* **Design** : Interface responsive, dégradés modernes, cartes épurées

### 5.3 Aperçu du code (App.tsx)

Gestion de l'état de connexion utilisateur :

```typescript
const [user, setUser] = useState<UserData | null>(null);

const handleLogout = () => {
    setUser(null);
    setFormData({ username: "", email: "", password: "" });
};

if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
} else {
    return <LoginForm onLogin={setUser} />;
}
```

---

## 6. ✅ Validation et Tests

### 6.1 Tests API (Curl)

Exemple de test d'inscription validé :

```bash
curl -X POST http://localhost:8081/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "Sami", "email": "sami@test.com", "password": "pass"}'
```

**Résultat** : `{"id":1, "username":"Sami", ...}`

### 6.2 Vérification Base de Données

Via Adminer (http://localhost:8080), les données sont bien persistées dans les tables PostgreSQL.