/**
 * StaticMobileTree - A completely static, simple genealogy tree for iOS Safari
 * 
 * This component uses ONLY basic HTML and inline styles to ensure maximum compatibility
 * with iOS Safari. No transforms, no complex CSS, no animations - just simple divs and text.
 */

interface StaticMobileTreeProps {
  distributorCode?: string;
  distributorName?: string;
  rank?: string;
  personalVolume?: number;
  teamVolume?: number;
  leftChild?: {
    name?: string;
    code?: string;
    rank?: string;
  } | null;
  rightChild?: {
    name?: string;
    code?: string;
    rank?: string;
  } | null;
  onEnrollLeft?: () => void;
  onEnrollRight?: () => void;
}

export default function StaticMobileTree({
  distributorCode = "DIST001",
  distributorName = "You",
  rank = "STARTER",
  personalVolume = 0,
  teamVolume = 0,
  leftChild = null,
  rightChild = null,
  onEnrollLeft,
  onEnrollRight
}: StaticMobileTreeProps) {
  // Rank colors - simple mapping
  const getRankColor = (r: string) => {
    const colors: Record<string, string> = {
      STARTER: "#c8ff00",
      BRONZE: "#cd7f32",
      SILVER: "#c0c0c0",
      GOLD: "#ffd700",
      PLATINUM: "#e5e4e2",
      DIAMOND: "#b9f2ff",
      EXECUTIVE: "#ff6b6b"
    };
    return colors[r?.toUpperCase()] || "#c8ff00";
  };

  return (
    <div style={{
      backgroundColor: "#0a0a0a",
      borderRadius: "12px",
      padding: "16px",
      minHeight: "400px"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
        paddingBottom: "12px",
        borderBottom: "1px solid #333"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>👥</span>
          <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>Your Team Tree</span>
        </div>
        <span style={{
          backgroundColor: "rgba(200, 255, 0, 0.2)",
          color: "#c8ff00",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px"
        }}>
          Mobile View
        </span>
      </div>

      {/* YOUR CARD - Root Node */}
      <div style={{
        backgroundColor: "#111",
        border: "3px solid #c8ff00",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: "0 0 20px rgba(200, 255, 0, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#c8ff00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            YOU
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>
              {distributorName}
            </div>
            <div style={{ color: "#888", fontSize: "12px" }}>
              {distributorCode}
            </div>
            <div style={{
              display: "inline-block",
              backgroundColor: `${getRankColor(rank)}20`,
              color: getRankColor(rank),
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              marginTop: "4px",
              border: `1px solid ${getRankColor(rank)}`
            }}>
              ⚡ {rank}
            </div>
          </div>
        </div>
        <div style={{
          display: "flex",
          gap: "16px",
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: "1px solid #333"
        }}>
          <div>
            <span style={{ color: "#c8ff00", fontWeight: "bold" }}>${personalVolume}</span>
            <span style={{ color: "#666", fontSize: "12px", marginLeft: "4px" }}>PV</span>
          </div>
          <div>
            <span style={{ color: "#00bfff", fontWeight: "bold" }}>${teamVolume}</span>
            <span style={{ color: "#666", fontSize: "12px", marginLeft: "4px" }}>TV</span>
          </div>
        </div>
      </div>

      {/* Connector Line */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "8px"
      }}>
        <div style={{
          width: "2px",
          height: "20px",
          backgroundColor: "#444"
        }} />
      </div>

      {/* Horizontal Line */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "8px"
      }}>
        <div style={{
          width: "60%",
          height: "2px",
          backgroundColor: "#444"
        }} />
      </div>

      {/* Two Legs Container */}
      <div style={{
        display: "flex",
        gap: "12px"
      }}>
        {/* LEFT LEG */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "8px"
          }}>
            <div style={{
              width: "2px",
              height: "20px",
              backgroundColor: "#444"
            }} />
          </div>
          
          <div style={{
            textAlign: "center",
            color: "#888",
            fontSize: "11px",
            marginBottom: "8px"
          }}>
            ← LEFT LEG
          </div>

          {leftChild ? (
            <div style={{
              backgroundColor: "#111",
              border: "2px solid #3b82f6",
              borderRadius: "10px",
              padding: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}>
                  {leftChild.name?.charAt(0)?.toUpperCase() || "L"}
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>
                    {leftChild.name || "Team Member"}
                  </div>
                  <div style={{ color: "#666", fontSize: "11px" }}>
                    {leftChild.code || "N/A"}
                  </div>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: `${getRankColor(leftChild.rank || "STARTER")}20`,
                    color: getRankColor(leftChild.rank || "STARTER"),
                    padding: "1px 6px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    marginTop: "2px"
                  }}>
                    {leftChild.rank || "STARTER"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={onEnrollLeft}
              style={{
                backgroundColor: "#0a0a0a",
                border: "2px dashed #444",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer"
              }}
            >
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#1a1a1a",
                border: "2px dashed #555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px"
              }}>
                <span style={{ fontSize: "20px" }}>➕</span>
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>Empty Position</div>
              <button
                onClick={onEnrollLeft}
                style={{
                  marginTop: "8px",
                  backgroundColor: "#c8ff00",
                  color: "black",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                ENROLL
              </button>
            </div>
          )}
        </div>

        {/* RIGHT LEG */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "8px"
          }}>
            <div style={{
              width: "2px",
              height: "20px",
              backgroundColor: "#444"
            }} />
          </div>
          
          <div style={{
            textAlign: "center",
            color: "#888",
            fontSize: "11px",
            marginBottom: "8px"
          }}>
            RIGHT LEG →
          </div>

          {rightChild ? (
            <div style={{
              backgroundColor: "#111",
              border: "2px solid #a855f7",
              borderRadius: "10px",
              padding: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a855f7",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}>
                  {rightChild.name?.charAt(0)?.toUpperCase() || "R"}
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>
                    {rightChild.name || "Team Member"}
                  </div>
                  <div style={{ color: "#666", fontSize: "11px" }}>
                    {rightChild.code || "N/A"}
                  </div>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: `${getRankColor(rightChild.rank || "STARTER")}20`,
                    color: getRankColor(rightChild.rank || "STARTER"),
                    padding: "1px 6px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    marginTop: "2px"
                  }}>
                    {rightChild.rank || "STARTER"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={onEnrollRight}
              style={{
                backgroundColor: "#0a0a0a",
                border: "2px dashed #444",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer"
              }}
            >
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#1a1a1a",
                border: "2px dashed #555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px"
              }}>
                <span style={{ fontSize: "20px" }}>➕</span>
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>Empty Position</div>
              <button
                onClick={onEnrollRight}
                style={{
                  marginTop: "8px",
                  backgroundColor: "#c8ff00",
                  color: "black",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                ENROLL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: "20px",
        padding: "12px",
        backgroundColor: "rgba(200, 255, 0, 0.1)",
        borderRadius: "8px",
        border: "1px solid rgba(200, 255, 0, 0.2)"
      }}>
        <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>
          <strong style={{ color: "#c8ff00" }}>💡 Tip:</strong> Build your team by enrolling new members in your left and right legs. 
          Balanced teams earn the highest commissions!
        </p>
      </div>
    </div>
  );
}
