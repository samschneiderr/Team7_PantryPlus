from pantry_summary import get_pantry_summary

def test_summary_counts_by_status():
    summary = get_pantry_summary()
    assert "expired" in summary
    assert "expiring soon" in summary
    assert "fresh" in summary
    assert all(isinstance(v, int) for v in summary.values())
