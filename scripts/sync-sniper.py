#!/usr/bin/env python3
"""Sync local Meme Sniper state to Supabase for cloud display.

Usage:
  python3 scripts/sync-sniper.py

Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY
"""
import json, os, sys
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    print("pip install supabase"); sys.exit(1)

SNIPER_DIR = Path(__file__).resolve().parent.parent.parent / "trading" / "scripts" / "meme_sniper"
STATE_FILE = SNIPER_DIR / "paper_state.json"
HISTORY_FILE = SNIPER_DIR / "trade_history.jsonl"

def main():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        # Try .env.local
        env_file = Path(__file__).resolve().parent.parent / ".env.local"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()
            url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"); sys.exit(1)

    sb = create_client(url, key)

    if not STATE_FILE.exists():
        print("❌ No paper_state.json found"); sys.exit(1)

    state = json.loads(STATE_FILE.read_text())
    
    positions = []
    for addr, pos in state.get("positions", {}).items():
        positions.append({
            "address": addr,
            "symbol": pos.get("symbol", "?"),
            "entry_price": pos.get("entry_price", 0),
            "size_sol": pos.get("size_sol", 0),
            "score": pos.get("score", 0),
            "pnl_pct": 0,
        })

    total_trades = state.get("total_trades", state.get("wins", 0) + state.get("losses", 0))
    wins = state.get("wins", 0)
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0

    sb.table("sniper_state").upsert({
        "id": "current",
        "balance_sol": state.get("balance_sol", 0),
        "total_pnl_pct": ((state.get("balance_sol", 10) / 10) - 1) * 100,
        "total_pnl_sol": state.get("total_pnl_sol", 0),
        "win_rate": round(win_rate, 1),
        "total_trades": total_trades,
        "max_drawdown": state.get("max_drawdown", 0),
        "positions": positions,
    }).execute()

    print(f"✅ Synced: {state.get('balance_sol', 0):.2f} SOL, {len(positions)} positions, {total_trades} trades")

    # Sync recent trades
    if HISTORY_FILE.exists():
        lines = HISTORY_FILE.read_text().strip().split("\n")
        recent = lines[-20:]  # Last 20
        for line in recent:
            try:
                t = json.loads(line)
                if t.get("action") in ("SELL", "PARTIAL_SELL"):
                    sb.table("sniper_trades").upsert({
                        "id": t.get("ts", "") + t.get("symbol", ""),
                        "symbol": t.get("symbol", "?"),
                        "action": t.get("action", ""),
                        "entry_price": t.get("entry_price"),
                        "exit_price": t.get("price"),
                        "pnl_pct": t.get("pnl_pct"),
                        "pnl_sol": t.get("pnl_sol"),
                        "score": t.get("score"),
                        "reason": t.get("reason", ""),
                    }).execute()
            except:
                pass
        print(f"✅ Synced {len(recent)} trade records")

if __name__ == "__main__":
    main()
