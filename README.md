# Pokemon Battle Planner

A web-based Pokemon battle planning tool for 6v6 battles. Build your team, select moves, and analyze type matchups against your opponents.

## Features

### Team Builder
- **My Team Panel**: Build your team of 6 Pokemon with 4 moves each
- **Enemy Team Panel**: Quickly add opponent Pokemon during battles
- **Searchable Pokemon Selector**: Over 1000 Pokemon with sprites
- **Move Selection**: Comprehensive move list with type indicators
- **Type Badges**: Color-coded type indicators for easy identification

### Save/Load System
- Save your teams to browser localStorage
- Load previously saved teams
- Delete unwanted teams
- Teams persist between sessions

### Battle View
- Select active Pokemon from each team
- View super-effective move matchups:
  - **Green arrows**: Your super-effective moves against enemy
  - **Red arrows**: Enemy super-effective moves against you
- Effectiveness indicators: 4x, 2x, 1x, ½x, ¼x, 0x

## Usage

1. **Open** `index.html` in any modern web browser
2. **Build Your Team**:
   - Click a Pokemon slot or "+" to add a Pokemon
   - Search by name or Pokedex number
   - Click "Add move..." to select moves for each Pokemon
3. **Set Up Enemy Team**:
   - Same process as your team
   - Use "Clear All" to reset between battles
4. **Save Your Team**:
   - Enter a team name
   - Click "Save Team"
5. **Battle View**:
   - Click "Battle View" tab
   - Click Pokemon cards to set active battlers
   - View move effectiveness arrows

## File Structure

```
pbattlegraph/
├── index.html          # Main HTML structure
├── styles.css          # Dark theme styling
├── app.js              # Application logic
├── data/
│   ├── pokemon.js      # All 1025 Pokemon (Gen 1-9)
│   ├── moves.js        # 400+ moves with types
│   └── type-chart.js   # Type effectiveness matrix
└── README.md
```

## Data Sources

- **Pokemon Sprites**: [PokeAPI Sprites](https://github.com/PokeAPI/sprites)
- **Type Chart**: Official Pokemon type effectiveness chart
- **Pokemon Data**: Generations 1-9 (up to Pecharunt #1025)

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Notes

- No internet required after initial load (sprites are cached)
- All data stored locally in browser
- No server required - just open the HTML file
